/* Szinkron a Google Drive-on keresztül, egy saját Apps Script közvetítővel.
   - Minden eszköz megjegyzi a legutóbb szinkronizált állapotot („alap”).
   - Szinkronkor háromutas összefésülés: alap ↔ helyi ↔ felhő, tételenként (azonosító szerint).
   - A „Callan postaládába” érkező fájlokat (Claude bejegyzései) feldolgozza, majd a közvetítő kitörli őket.
   - Minden feltöltéskor egy olvasható összefoglalót is ment („Callan – áttekintés”). */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util, Sch = CA.sched, Store = CA.store;
  var Y = CA.sync = {};

  /* ---------- Háromutas összefésülés ---------- */
  function stable(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    return '{' + Object.keys(v).filter(function (k) { return v[k] !== undefined; }).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(v[k]); }).join(',') + '}';
  }
  function eq(a, b) { return a === b || stable(a) === stable(b); }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function isIdArr(v) { return Array.isArray(v) && v.every(function (x) { return isObj(x) && x.id != null; }); }
  function has(o, k) { return o != null && Object.prototype.hasOwnProperty.call(o, k); }
  function mergeEntry(b, l, r, inB, inL, inR) {
    // visszaad: { keep: bool, val }
    if (!inL && !inR) return { keep: false };
    if (!inR) { if (inB && eq(b, l)) return { keep: false }; return { keep: true, val: l }; }      // felhőben törölték, itt nem változott → törlés
    if (!inL) { if (inB && eq(b, r)) return { keep: false }; return { keep: true, val: r }; }      // itt törölték, a felhőben nem változott → törlés
    return { keep: true, val: merge(inB ? b : undefined, l, r) };
  }
  function merge(b, l, r) {
    if (eq(l, r)) return l;
    if (b !== undefined && eq(b, l)) return r;
    if (b !== undefined && eq(b, r)) return l;
    if (isObj(l) && isObj(r)) {
      var ob = isObj(b) ? b : null, out = {}, keys = {};
      Object.keys(r).forEach(function (k) { keys[k] = 1; });
      Object.keys(l).forEach(function (k) { keys[k] = 1; });
      Object.keys(keys).forEach(function (k) {
        var m = mergeEntry(ob ? ob[k] : undefined, l[k], r[k], has(ob, k), has(l, k), has(r, k));
        if (m.keep) out[k] = m.val;
      });
      return out;
    }
    if (isIdArr(l) && isIdArr(r)) {
      var bm = {}, lm = {}, rm = {}, order = [], seen = {};
      if (isIdArr(b)) b.forEach(function (x) { bm[x.id] = x; });
      l.forEach(function (x) { lm[x.id] = x; });
      r.forEach(function (x) { rm[x.id] = x; if (!seen[x.id]) { seen[x.id] = 1; order.push(x.id); } });
      l.forEach(function (x) { if (!seen[x.id]) { seen[x.id] = 1; order.push(x.id); } });
      var res = [];
      order.forEach(function (id) {
        var m = mergeEntry(bm[id], lm[id], rm[id], has(bm, id), has(lm, id), has(rm, id));
        if (m.keep) res.push(m.val);
      });
      return res;
    }
    return l; // valódi ütközés: mindkét helyen másra változott → ez az eszköz nyer
  }
  Y.merge = merge;
  Y.eq = eq;

  /* ---------- Postaláda: Claude bejegyzései ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function findByName(arr, name, field) {
    if (!name) return null;
    var n = norm(name), f = field || 'name';
    return arr.find(function (x) { return norm(x[f]) === n; }) || arr.find(function (x) { return norm(x[f]).indexOf(n) === 0; }) || arr.find(function (x) { return norm(x[f]).indexOf(n) >= 0; }) || null;
  }
  function dateOk(d) { return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null; }
  function timeOk(t) { if (typeof t !== 'string') return null; var m = t.match(/^(\d{1,2}):(\d{2})$/); return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : null; }
  function numOk(n) { var v = typeof n === 'number' ? n : U.parseNum(n); return v != null && v > 0 ? v : null; }

  Y.applyOps = function (state, doc) {
    var done = [], skipped = [];
    (doc.ops || []).forEach(function (op) {
      try {
        var kind = norm(op.op || op.type), title = String(op.title || op.name || '').trim();
        if (!title) { skipped.push('cím nélküli tétel'); return; }
        var p = findByName(state.projects.filter(function (x) { return !x.archived; }), op.project);
        var c = findByName(state.categories, op.category) || (p ? Sch.cat(state, p.catId) : null);
        if (kind === 'task' || kind === 'feladat') {
          var hours = numOk(op.hours), est = numOk(op.est || op.minutes) || (hours ? Math.round(hours * 60) : null);
          var due = dateOk(op.due);
          var t = { id: U.uid(), title: title, done: false, pushes: 0, spent: 0, createdAt: Date.now(), projectId: p ? p.id : null, catId: c ? c.id : null, from: 'claude' };
          if (due) { t.mode = 'due'; t.due = due; t.est = est || 60; t.chunk = 60; }
          else { t.mode = 'day'; t.date = dateOk(op.date); t.time = timeOk(op.time); t.est = est; }
          if (op.remind !== undefined) t.remind = op.remind;
          state.tasks.push(t);
          done.push('feladat: ' + title);
        } else if (kind === 'event' || kind === 'esemeny') {
          var d = dateOk(op.date);
          if (!d) { skipped.push(title + ' (nincs dátum)'); return; }
          var allDay = !!op.allDay || !timeOk(op.start);
          var st = timeOk(op.start), en = timeOk(op.end) || (st ? U.toInputTime(U.toMin(st) + 60) : null);
          var ev = { id: U.uid(), title: title, date: d, start: allDay ? null : st, end: allDay ? null : en, allDay: allDay, travel: numOk(op.travel) || 0, catId: c ? c.id : null, projectId: p ? p.id : null, note: op.note || '', from: 'claude' };
          if (op.remind !== undefined) ev.remind = op.remind;
          state.events.push(ev);
          done.push('esemény: ' + title);
        } else if (kind === 'idea' || kind === 'otlet') {
          var wp = findByName(state.projects.filter(function (x) { return x.catId === 'write' && !x.archived; }), op.project);
          state.ideas.push({ id: U.uid(), title: title, body: String(op.body || op.text || ''), projectId: wp ? wp.id : null, dictated: false, createdAt: Date.now(), from: 'claude' });
          done.push('ötlet: ' + title);
        } else if (kind === 'treasure' || kind === 'kincs') {
          var tc = findByName(state.treasureCats, op.category) || state.treasureCats.find(function (x) { return x.id === 'other'; }) || state.treasureCats[0];
          state.treasures.push({ id: U.uid(), title: title, type: tc ? tc.id : 'other', buy: String(op.where || op.buy || ''), link: String(op.link || ''), date: dateOk(op.date), got: false, note: String(op.note || ''), createdAt: Date.now(), from: 'claude' });
          done.push('kincs: ' + title);
        } else if (kind === 'project' || kind === 'projekt') {
          if (findByName(state.projects, title) && norm(findByName(state.projects, title).name) === norm(title)) { skipped.push(title + ' (már van ilyen projekt)'); return; }
          var cat = findByName(state.categories, op.category) || state.categories[0];
          var coll = norm(op.kind) === 'collection' || norm(op.kind) === 'gyujto';
          var dl = dateOk(op.deadline);
          state.projects.push({ id: 'p_' + U.uid(), name: title, catId: cat.id, kind: coll ? 'collection' : 'goal', goal: { type: 'none' }, deadline: coll ? null : dl, countdown: !!(dl && op.countdown), note: String(op.note || ''), createdAt: Date.now(), from: 'claude' });
          done.push('projekt: ' + title);
        } else skipped.push(title + ' (ismeretlen típus: ' + (op.op || op.type) + ')');
      } catch (e) { skipped.push(String(op && op.title) + ' (hiba)'); }
    });
    return { done: done, skipped: skipped };
  };

  function processInbox(state, inbox) {
    state.inboxApplied = state.inboxApplied || [];
    state.inboxLog = state.inboxLog || [];
    var ids = [], entries = [];
    (inbox || []).forEach(function (f) {
      ids.push(f.id);
      if (state.inboxApplied.indexOf(f.id) >= 0) return;
      var doc = null;
      try { doc = JSON.parse(f.text || ''); } catch (e) { doc = null; }
      var res = doc && Array.isArray(doc.ops) ? Y.applyOps(state, doc) : { done: [], skipped: [f.name + ' (nem olvasható)'] };
      state.inboxApplied.push(f.id);
      var entry = { id: f.id, at: Date.now(), from: (doc && doc.from) || 'Claude', note: (doc && doc.note) || '', done: res.done, skipped: res.skipped };
      state.inboxLog.push(entry); entries.push(entry);
    });
    state.inboxApplied = state.inboxApplied.slice(-300);
    state.inboxLog = state.inboxLog.slice(-40);
    return { ids: ids, entries: entries };
  }

  /* ---------- Összefoglaló Claude-nak ---------- */
  Y.summary = function (state) {
    var t = U.today(), L = [];
    function p(x) { L.push(x); }
    function proj(id) { var x = Sch.proj(state, id); return x ? x.name : ''; }
    function cat(id) { var x = Sch.cat(state, id); return x ? x.name : ''; }
    p('# Callan – áttekintés');
    p('Frissítve: ' + new Date().toISOString() + ' · ma: ' + t + ' (' + U.DAYS[U.dow(t)] + ')');
    p('Ezt a fájlt Callan írja minden szinkronkor. Új tételt a „Callan postaláda” mappába írt JSON-fájllal lehet felvenni (formátum: a Callan README „Claude-kapcsolat” része).');
    p('');
    p('## Kategóriák');
    state.categories.forEach(function (c) { p('- ' + c.name); });
    p('');
    p('## Projektek');
    state.categories.forEach(function (c) {
      state.projects.filter(function (x) { return x.catId === c.id && !x.archived; }).forEach(function (x) {
        var acts = state.activities.filter(function (a) { return a.projectId === x.id && !a.paused; }).map(function (a) { return a.title + ' (' + Sch.describe(a) + (a.time ? ', ' + a.time : '') + ', ' + a.dur + ' perc)'; });
        var goal = x.goal && x.goal.type === 'quantity' && x.goal.target ? ' · cél: ' + x.goal.target + ' ' + (x.goal.unit || '') : '';
        p('- ' + x.name + ' [' + c.name + ', ' + (x.kind === 'collection' ? 'gyűjtő' : 'célprojekt') + ']' + goal + (x.deadline ? ' · határidő: ' + x.deadline : '') + (acts.length ? ' · ütemezés: ' + acts.join('; ') : ''));
      });
    });
    p('');
    p('## Mai nap (' + t + ')');
    Sch.getDay(state, t).items.filter(function (i) { return i.kind !== 'template' && i.kind !== 'close' && i.kind !== 'travel'; }).forEach(function (i) {
      p('- ' + (i.start != null ? U.toHM(i.start) + '–' + U.toHM(i.end) : (i.allDay ? 'egész nap' : 'időpont nélkül')) + ' ' + i.title + (i.kind === 'event' ? ' (esemény)' : i.kind === 'task' ? ' (feladat)' : '') + (i.done ? ' ✓' : ''));
    });
    p('');
    p('## Közelgő események (30 nap)');
    var evs = state.events.filter(function (e) { return e.date >= t && e.date <= U.addDays(t, 30); }).sort(function (a, b) { return (a.date + (a.start || '')) < (b.date + (b.start || '')) ? -1 : 1; });
    if (!evs.length) p('- nincs');
    evs.forEach(function (e) { p('- ' + e.date + (e.allDay ? ' egész nap' : ' ' + e.start + '–' + e.end) + ' · ' + e.title + (e.projectId ? ' · ' + proj(e.projectId) : '') + (e.note ? ' · ' + e.note : '')); });
    p('');
    p('## Nyitott feladatok');
    var open = state.tasks.filter(function (x) { return !x.done; });
    if (!open.length) p('- nincs');
    open.forEach(function (x) {
      p('- ' + x.title + (x.mode === 'due' ? ' · határidő: ' + (x.due || '–') + ' · ' + Math.round((x.spent || 0) / 6) / 10 + '/' + Math.round((x.est || 0) / 6) / 10 + ' óra' : ' · ' + (x.date || 'nincs napja') + (x.time ? ' ' + x.time : '') + (x.est ? ' · ' + x.est + ' perc' : '')) + (x.projectId ? ' · ' + proj(x.projectId) : (x.catId ? ' · ' + cat(x.catId) : '')));
    });
    p('');
    p('## Szokások');
    state.activities.filter(function (a) { return a.habit && !a.paused; }).forEach(function (a) { var s = Sch.streak(state, a); p('- ' + a.title + ': ' + s.cur + ' ' + s.unit + ' sorozat (rekord ' + s.best + ')'); });
    p('');
    p('## Ötletek (legutóbbi 40)');
    state.ideas.slice().sort(function (a, b) { return b.createdAt - a.createdAt; }).slice(0, 40).forEach(function (i) { p('- ' + i.title + (i.projectId ? ' [' + proj(i.projectId) + ']' : '') + (i.body ? ': ' + i.body.replace(/\s+/g, ' ').slice(0, 200) : '')); });
    p('');
    p('## Kincsesláda');
    state.treasures.filter(function (x) { return !x.got; }).forEach(function (x) { var tc = (state.treasureCats || []).find(function (c) { return c.id === x.type; }); p('- ' + x.title + ' [' + (tc ? tc.name : '') + ']' + (x.buy ? ' · ' + x.buy : '') + (x.date ? ' · ' + x.date : '') + (x.link ? ' · ' + x.link : '')); });
    p('');
    p('## Kincs-kategóriák');
    (state.treasureCats || []).forEach(function (c) { p('- ' + c.name + ' (' + c.kind + ')'); });
    return L.join('\n');
  };

  /* ---------- Hálózat ---------- */
  function call(cfg, body) {
    body.secret = cfg.secret;
    // text/plain, egyedi fejléc nélkül: így a böngésző nem küld előzetes CORS-kérést
    return fetch(cfg.url, { method: 'POST', body: JSON.stringify(body), redirect: 'follow' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (txt) {
      var j; try { j = JSON.parse(txt); } catch (e) { throw new Error('A közvetítő nem JSON-t adott vissza. Jó a cím (…/exec)?'); }
      if (!j.ok && j.error === 'auth') throw new Error('Hibás titkos kulcs.');
      if (!j.ok && j.error && !j.conflict) throw new Error(j.error);
      return j;
    });
  }

  /* ---------- Vezérlés ---------- */
  var H = null;           // app-horgok: getState, setState, isBusy, onChange
  var cfg = null;         // { url, secret, device, baseRev, base, lastSync, lastError, connected, pending }
  var running = null, again = false;

  function deviceName() { return /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? 'Telefon' : 'Számítógép'; }
  Y.cfg = function () { return cfg; };
  Y.init = function (hooks) {
    H = hooks;
    return Store.getLocal('sync').then(function (c) {
      cfg = c || null;
      if (cfg && !cfg.device) cfg.device = deviceName();
      return cfg;
    });
  };
  function saveCfg() { return Store.putLocal('sync', cfg); }

  function counts(st) {
    if (!st) return null;
    return { tasks: (st.tasks || []).length, events: (st.events || []).length, ideas: (st.ideas || []).length, treasures: (st.treasures || []).length, days: Object.keys(st.days || {}).length };
  }
  Y.counts = counts;
  /* Még használatlan eszköz (csak a kezdő adatok vannak rajta)? */
  Y.pristine = function (st) {
    var c = counts(st);
    return !c.tasks && !c.events && !c.ideas && !c.treasures && c.days <= 1 && !Object.keys(st.metricLogs || {}).length && !(st.periods || []).length;
  };
  /* Link egy másik eszköz csatlakoztatásához (a titkos kulcs is benne van!). */
  Y.link = function () {
    if (!cfg) return '';
    return location.origin + location.pathname.replace(/index\.html$/, '') + '#callan-sync=' + encodeURIComponent(cfg.url) + '&k=' + encodeURIComponent(cfg.secret);
  };
  Y.parseLink = function (hash) {
    var m = String(hash || '').match(/callan-sync=([^&]+)&k=([^&]+)/);
    return m ? { url: decodeURIComponent(m[1]), secret: decodeURIComponent(m[2]) } : null;
  };

  Y.connect = function (url, secret) {
    var both = String(url || '').match(/^(.*?\/exec)#(.+)$/);
    if (both && !secret) { url = both[1]; secret = both[2]; }
    url = String(url || '').trim(); secret = String(secret || '').trim();
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) return Promise.reject(new Error('A címnek így kell kezdődnie: https://script.google.com/macros/s/…/exec'));
    if (!secret) return Promise.reject(new Error('Add meg a titkos kulcsot.'));
    var c = { url: url, secret: secret, device: (cfg && cfg.device) || deviceName(), baseRev: 0, base: null, connected: false, seen: (cfg && cfg.seen) || [] };
    return call(c, { action: 'pull' }).then(function (j) {
      cfg = c; cfg.remoteHasData = !!(j.state && j.rev > 0);
      return saveCfg().then(function () {
        return { remoteHasData: cfg.remoteHasData, savedAt: j.savedAt, device: j.device, remote: counts(j.state), local: counts(H.getState()), localPristine: Y.pristine(H.getState()) };
      });
    });
  };
  /* Első csatlakozás: 'cloud' = a felhő adatai lesznek itt is; 'local' = ennek az eszköznek az adatai mennek fel. */
  Y.start = function (mode) {
    if (!cfg) return Promise.reject(new Error('Nincs beállítva.'));
    return call(cfg, { action: 'pull' }).then(function (j) {
      if (mode === 'cloud' && j.state) {
        // biztonsági másolat erről az eszközről, mielőtt a felhő adatai felülírják
        if (!Y.pristine(H.getState())) Store.putLocal('beforeSync', { at: Date.now(), state: H.getState() });
        var s = Store.migrate(j.state);
        cfg.seen = (s.inboxLog || []).map(function (e) { return e.id; });
        cfg.base = JSON.parse(JSON.stringify(s)); cfg.baseRev = j.rev; cfg.connected = true;
        H.setState(s, { replaced: true });
        return saveCfg().then(function () { return Y.sync(); });
      }
      cfg.base = null; cfg.baseRev = j.rev; cfg.connected = true;
      cfg.forceLocal = true;
      return saveCfg().then(function () { return Y.sync(); });
    });
  };
  /* Claude bejegyzései, amiket ezen az eszközön még nem mutattunk meg. */
  Y.news = function (state) {
    var seen = (cfg && cfg.seen) || [];
    return (state.inboxLog || []).filter(function (e) { return seen.indexOf(e.id) < 0 && (e.done.length || e.skipped.length); });
  };
  Y.markSeen = function (state) {
    if (!cfg) return;
    cfg.seen = (cfg.seen || []).concat((state.inboxLog || []).map(function (e) { return e.id; })).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(-200);
    saveCfg();
  };
  /* Várakozás: üres eszköz, üres felhő → megvárjuk, hogy a telefon feltöltse az adatait. */
  Y.wait = function () { if (cfg) { cfg.waiting = true; cfg.connected = false; return saveCfg(); } return Promise.resolve(); };
  Y.checkWaiting = function () {
    if (!cfg || !cfg.waiting) return Promise.resolve(false);
    return call(cfg, { action: 'pull' }).then(function (j) {
      if (!(j.state && j.rev > 0)) return false;
      cfg.waiting = false;
      return Y.start('cloud').then(function () { return true; });
    }).catch(function () { return false; });
  };
  Y.backup = function () { return Store.getLocal('beforeSync'); };
  Y.restoreBackup = function () {
    return Store.getLocal('beforeSync').then(function (b) {
      if (!b || !b.state) return false;
      H.setState(Store.migrate(b.state), { replaced: true });
      if (cfg && cfg.connected) cfg.forceLocal = true;
      return Store.putLocal('beforeSync', null).then(function () { return Y.sync(); }).then(function () { return true; });
    });
  };
  Y.disconnect = function () { cfg = null; return Store.putLocal('sync', null); };
  Y.setDevice = function (name) { if (cfg && name) { cfg.device = name; saveCfg(); } };

  /* Egy szinkron kör: letöltés → összefésülés → postaláda → feltöltés. Ütközésnél újrapróbálja. */
  Y.sync = function () {
    if (!cfg || !cfg.connected) return Promise.resolve({ ok: false, skipped: true });
    if (running) { again = true; return running; }
    running = round(0).then(function (r) {
      cfg.lastError = null; cfg.lastSync = Date.now();
      return saveCfg().then(function () { return r; });
    }, function (e) {
      cfg.lastError = (e && e.message) || 'hálózati hiba';
      return saveCfg().then(function () { return { ok: false, error: cfg.lastError }; });
    }).then(function (r) {
      running = null;
      if (H.onChange) H.onChange(r);
      if (again) { again = false; setTimeout(Y.sync, 50); }
      return r;
    });
    return running;
  };

  function round(attempt) {
    return call(cfg, { action: 'pull' }).then(function (j) { return mergeAndPush(j, attempt); });
  }

  function mergeAndPush(j, attempt) {
    if (H.isBusy && H.isBusy()) return { ok: true, deferred: true };   // gépelés közben nem írjuk át az állapotot
    var local = H.getState();
    var remote = j.state ? Store.migrate(JSON.parse(JSON.stringify(j.state))) : null;
    var merged;
    if (!remote || cfg.forceLocal) merged = JSON.parse(JSON.stringify(local));
    else merged = merge(cfg.base ? Store.migrate(JSON.parse(JSON.stringify(cfg.base))) : undefined, JSON.parse(JSON.stringify(local)), remote);
    var inbox = processInbox(merged, j.inbox);
    var changedLocal = !eq(merged, local);
    var needPush = !remote || cfg.forceLocal || !eq(merged, remote) || inbox.ids.length > 0 || cfg.summaryDay !== U.today();
    if (changedLocal) H.setState(merged, { entries: inbox.entries });
    if (!needPush) {
      cfg.base = JSON.parse(JSON.stringify(merged)); cfg.baseRev = j.rev;
      return { ok: true, pushed: false, entries: inbox.entries };
    }
    var body = { action: 'push', baseRev: j.rev, device: cfg.device, state: merged, summary: Y.summary(merged), done: inbox.ids };
    return call(cfg, body).then(function (r) {
      if (r.conflict) {
        if (attempt >= 3) throw new Error('Ütközés: többször is változott közben a felhőben. Később újrapróbálom.');
        // valaki közben feltöltött: újra összefésülünk az új felhős állapottal
        cfg.forceLocal = false;
        return mergeAndPush(r, attempt + 1);
      }
      cfg.forceLocal = false; cfg.summaryDay = U.today();
      cfg.base = JSON.parse(JSON.stringify(merged)); cfg.baseRev = r.rev;
      return { ok: true, pushed: true, entries: inbox.entries };
    });
  }
})();
