/* Vezérlő: állapot, kirajzolás, műveletek. */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util, Sch = CA.sched, Store = CA.store, V = CA.views;
  CA.VERSION = '1.0.0';
  var ALL = [0, 1, 2, 3, 4, 5, 6];

  var state = null, root = null;
  var ui = {
    tab: 'ma', sheet: null, stack: [], cal: { month: null, sel: null }, notes: 'ideas', ideaF: 'all', trF: 'all', res: 7,
    q: { title: '', body: '', proj: '', dictated: false }, showGot: false, showDone: false, showPast: false, showArch: false,
    toast: null, update: null, listening: false, persisted: false, day: null
  };
  CA.ui = ui;

  /* ---------- Kirajzolás ---------- */
  var lastSheetKey = '', lastTab = '';
  function sheetKey() { return ui.sheet ? ui.sheet.type + ':' + (ui.sheet.id || '') : ''; }
  function render() {
    if (!state) return;
    var sheetEl = root.querySelector('.sheet'), sTop = sheetEl ? sheetEl.scrollTop : 0;
    var y = window.scrollY;
    var ae = document.activeElement, aid = ae && ae.id, sel = null;
    try { if (ae && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { sel = null; }
    root.innerHTML = V.screen(state, ui) + V.nav(ui) + (ui.sheet ? V.sheet(state, ui) : '') + V.toast(ui);
    document.body.style.overflow = ui.sheet ? 'hidden' : '';
    var key = sheetKey();
    if (ui.sheet && key === lastSheetKey) { var s2 = root.querySelector('.sheet'); if (s2) s2.scrollTop = sTop; }
    if (ui.tab !== lastTab) window.scrollTo(0, 0); else window.scrollTo(0, y);
    lastSheetKey = key; lastTab = ui.tab;
    if (aid) {
      var el = document.getElementById(aid);
      if (el && el !== document.activeElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        el.focus({ preventScroll: true });
        if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* nem szöveges mező */ } }
      }
    }
  }
  function commit() { Store.save(state); render(); }
  var toastTimer = null;
  function toast(text, a, id, label) {
    ui.toast = { text: text, a: a, id: id, label: label };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { ui.toast = null; render(); }, a ? 8000 : 3500);
    render();
  }
  function ensureToday() {
    var t = U.today();
    if (ui.day !== t) {
      ui.day = t;
      if (Sch.fixDay(state, t)) Store.save(state);
    }
  }
  function isTyping() { var a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }

  /* ---------- Útvonal-segédek ---------- */
  function setPath(obj, path, v) {
    var ps = path.split('.'), o = obj;
    for (var i = 0; i < ps.length - 1; i++) o = o[/^\d+$/.test(ps[i]) ? +ps[i] : ps[i]];
    o[/^\d+$/.test(ps[ps.length - 1]) ? +ps[ps.length - 1] : ps[ps.length - 1]] = v;
  }
  function getPath(obj, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[/^\d+$/.test(k) ? +k : k]; }, obj); }

  /* ---------- Lapok megnyitása ---------- */
  function newAct() { return { title: '', type: 'daily', n: 2, quota: 1, days: ALL.slice(), time: '', dur: 30, important: false, habit: true }; }
  function openSheet(type, ds) {
    ds = ds || {};
    var t = U.today(), s = { type: type, id: ds.id || null, date: ds.date || null };
    if (type === 'newcat') {
      var used = state.categories.map(function (c) { return c.color; });
      s.draft = { name: '', color: Store.PALETTE.find(function (c) { return used.indexOf(c) < 0; }) || Store.PALETTE[0] };
    } else if (type === 'entry') {
      if (ds.edit === 'event') {
        var e = state.events.find(function (x) { return x.id === ds.id; });
        if (!e) return;
        s.draft = { mode: 'event', editId: e.id, title: e.title, date: e.date, start: e.start || '', end: e.end || '', allDay: !!e.allDay, travel: e.travel || '', catId: e.catId, projectId: e.projectId || '', note: e.note || '', res: {} };
      } else if (ds.edit === 'task') {
        var k = state.tasks.find(function (x) { return x.id === ds.id; });
        if (!k) return;
        s.draft = { mode: 'task', editId: k.id, title: k.title, date: k.date || '', catId: k.catId, projectId: k.projectId || '', res: {} };
      } else {
        var p = ds.proj ? Sch.proj(state, ds.proj) : null;
        s.draft = { mode: ds.mode || 'event', title: '', date: ds.date || ui.cal.sel || t, start: '', end: '', allDay: false, travel: '', catId: p ? p.catId : null, projectId: p ? p.id : '', note: '', res: {} };
      }
      s.id = ds.id || 'new';
    } else if (type === 'projForm') {
      if (ds.id) {
        var pr = Sch.proj(state, ds.id);
        var gm = pr.goal && pr.goal.metricId ? state.metrics.find(function (m) { return m.id === pr.goal.metricId; }) : state.metrics.find(function (m) { return m.projectId === pr.id && m.projectMetric; });
        s.draft = {
          id: pr.id, kind: pr.kind, name: pr.name, catId: pr.catId, note: pr.note || '', goalType: (pr.goal && pr.goal.type) || 'none',
          target: pr.goal && pr.goal.target != null ? pr.goal.target : '', unit: (pr.goal && pr.goal.unit) || '', start: pr.goal && pr.goal.start ? pr.goal.start : '',
          hasDeadline: !!pr.deadline, deadline: pr.deadline || '', countdown: !!pr.countdown,
          acts: state.activities.filter(function (a) { return a.projectId === pr.id; }).map(function (a) {
            return { id: a.id, title: a.title, type: a.sched.type === 'weekdays' ? 'daily' : a.sched.type, n: a.sched.n || 2, quota: a.sched.quota || 1, days: (a.sched.days && a.sched.days.length ? a.sched.days : ALL).slice(), time: a.time || '', dur: a.dur, important: !!a.important, habit: !!a.habit };
          }),
          metricOn: !!gm, metricId: gm ? gm.id : null, metricName: gm ? gm.name : '', metricUnit: gm ? gm.unit : '', metricTarget: gm && gm.target != null ? gm.target : ''
        };
      } else {
        s.draft = { kind: 'goal', name: '', catId: state.categories[0] ? state.categories[0].id : null, note: '', goalType: 'none', target: '', unit: '', start: '', hasDeadline: false, deadline: '', countdown: true, acts: [newAct()], metricOn: false, metricName: '', metricUnit: '', metricTarget: '' };
      }
    } else if (type === 'idea') {
      var i = state.ideas.find(function (x) { return x.id === ds.id; });
      if (!i) return;
      s.draft = { title: i.title, body: i.body, projectId: i.projectId || '' };
    } else if (type === 'treasure') {
      var tr = ds.id ? state.treasures.find(function (x) { return x.id === ds.id; }) : null;
      s.draft = tr ? JSON.parse(JSON.stringify(tr)) : { title: '', type: 'book', seen: '', buy: '', link: '', date: '', got: false };
      s.id = ds.id || 'new';
    } else if (type === 'weight') {
      var lw = state.metricLogs[t] && state.metricLogs[t].m_weight;
      s.draft = { date: t, v: lw != null ? String(lw).replace('.', ',') : '' };
    }
    if (ui.sheet) ui.stack.push(ui.sheet);
    ui.sheet = s;
    render();
  }
  function closeSheet() { ui.sheet = ui.stack.pop() || null; render(); }
  function closeAll() { ui.sheet = null; ui.stack = []; }

  /* ---------- Biztonsági mentés ---------- */
  function doBackup() {
    var blob = Store.exportBlob(state);
    // Az Android megosztás a .txt-t biztosan elfogadja; a visszaállítás bármelyik kiterjesztést olvassa.
    var name = 'callan-mentes-' + U.today() + '.txt';
    var file = null;
    try { file = new File([blob], name, { type: 'text/plain' }); } catch (e) { file = null; }
    function done() { state.settings.lastBackup = U.today(); Store.save(state); toast('Biztonsági másolat kész.'); }
    function download() {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
      done();
    }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Callan mentés' }).then(done).catch(function (err) { if (err && err.name === 'AbortError') return; download(); });
    } else download();
  }

  /* ---------- Diktálás ---------- */
  var rec = null;
  function mic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Itt nem tudok diktálást indítani. A billentyűzet mikrofonja ugyanígy működik.'); return; }
    if (ui.listening && rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = 'hu-HU'; rec.continuous = true; rec.interimResults = true;
    var base = ui.q.body ? ui.q.body.replace(/\s*$/, ' ') : '';
    rec.onresult = function (e) {
      var fin = '', inter = '';
      for (var i = e.resultIndex; i < e.results.length; i++) { var r = e.results[i]; if (r.isFinal) fin += r[0].transcript; else inter += r[0].transcript; }
      if (fin) base += fin.trim() + ' ';
      ui.q.body = (base + inter).trim(); ui.q.dictated = true;
      var ta = document.getElementById('q-body'); if (ta) ta.value = ui.q.body;
    };
    rec.onerror = function (e) {
      ui.listening = false;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('A mikrofon nincs engedélyezve. A böngésző webhely-beállításaiban kapcsolhatod be.');
      else if (e.error === 'network') toast('A diktáláshoz internetkapcsolat kell.');
      else render();
    };
    rec.onend = function () { ui.listening = false; render(); };
    try { rec.start(); ui.listening = true; render(); } catch (e) { toast('A diktálás most nem indult el. Próbáld újra.'); }
  }

  /* ---------- Segédek ---------- */
  function metricAutoDone(m, v, date) {
    if (!m.activityId || v == null) return;
    var day = state.days[date]; if (!day) return;
    var it = day.items.find(function (i) { return i.refId === m.activityId; }); if (!it) return;
    var ok = m.doneWhen === 'target' ? (m.target ? v >= m.target : v > 0) : v > 0;
    if (ok) it.done = true;
  }
  function removeActsFromDays(ids) {
    var t = U.today();
    Object.keys(state.days).forEach(function (d) {
      if (d < t) return;
      var day = state.days[d];
      day.items = day.items.filter(function (i) { return !(i.kind === 'activity' && ids[i.refId] && !i.done); });
      day.top3 = (day.top3 || []).filter(function (id) { return day.items.some(function (i) { return i.id === id; }); });
    });
  }

  /* ---------- Műveletek ---------- */
  var A = {};
  A.tab = function (d) { ui.tab = d.t; closeAll(); if (d.t === 'cal' && !ui.cal.sel) ui.cal.sel = U.today(); render(); };
  A.open = function (d) { openSheet(d.s, d); };
  A.close = function () { closeSheet(); };
  A.d = function (d) {
    setPath(ui.sheet.draft, d.k, d.v);
    if (d.k === 'mode') ui.sheet.draft.res = {};
    render();
  };
  A.dToggle = function (d) { setPath(ui.sheet.draft, d.k, !getPath(ui.sheet.draft, d.k)); render(); };
  A.dDay = function (d) {
    var arr = ui.sheet.draft.acts[+d.i].days, k = +d.d, at = arr.indexOf(k);
    if (at >= 0) { if (arr.length > 1) arr.splice(at, 1); } else { arr.push(k); arr.sort(); }
    render();
  };
  A.dActAdd = function () { var a = newAct(); a.title = ''; ui.sheet.draft.acts.push(a); render(); };
  A.dActDel = function (d) { ui.sheet.draft.acts.splice(+d.i, 1); render(); };
  A.dRes = function (d) { var r = ui.sheet.draft.res; r[d.id] = r[d.id] === d.how ? undefined : d.how; render(); };

  A.done = function (d) {
    var day = state.days[d.date];
    if (!day) return;
    var it = day.items.find(function (i) { return i.id === d.id; });
    if (!it) return;
    it.done = !it.done; it.doneAt = it.done ? Date.now() : null;
    commit();
  };
  A.star = function (d) {
    var day = state.days[d.date]; if (!day) return;
    day.top3 = day.top3 || [];
    var at = day.top3.indexOf(d.id);
    if (at >= 0) day.top3.splice(at, 1);
    else if (day.top3.length >= 3) { toast('Legfeljebb három fő dolog lehet. Előbb vegyél ki egyet.'); return; }
    else day.top3.push(d.id);
    commit();
  };
  A.task = function (d) {
    var t = state.tasks.find(function (x) { return x.id === d.id; }); if (!t) return;
    t.done = !t.done; t.doneAt = t.done ? Date.now() : null;
    commit();
  };
  A.taskMove = function (d) {
    var i = state.tasks.findIndex(function (x) { return x.id === d.id; }); if (i < 0) return;
    if (d.to === 'del') { var gone = state.tasks.splice(i, 1)[0]; commit(); toast('„' + gone.title + '" törölve.'); return; }
    var t = state.tasks[i];
    t.date = d.to === 'today' ? U.today() : U.addDays(U.today(), 1);
    t.pushes = (t.pushes || 0) + 1;
    commit();
  };
  A.taskDate = function (d) {
    var t = state.tasks.find(function (x) { return x.id === d.id; }); if (!t) return;
    t.date = d.d; commit(); toast('Beosztva: ' + U.fmtLong(d.d) + '.');
  };
  A.addTask = function (d) {
    var ti = document.getElementById('nt-title'), dt = document.getElementById('nt-date');
    var title = ti && ti.value.trim();
    if (!title) { toast('Írd be, mi a feladat.'); return; }
    var p = Sch.proj(state, d.id);
    state.tasks.push({ id: U.uid(), title: title, date: (dt && dt.value) || null, projectId: d.id, catId: p ? p.catId : null, done: false, pushes: 0, createdAt: Date.now() });
    commit();
  };
  A.resolve = function (d) {
    Sch.resolve(state, d.date, d.id, d.how);
    if (ui.sheet && ui.sheet.type === 'item') closeAll();
    Store.save(state);
    toast({ later: 'Áttettem későbbre.', skip: 'Aznap kimarad.', tomorrow: 'Átkerült másnapra.' }[d.how]);
  };
  A.itemTime = function (d) {
    var v = (document.getElementById('it-time') || {}).value;
    if (!v) { toast('Adj meg egy időpontot.'); return; }
    var info = Sch.getDay(state, d.date), it = info.items.find(function (i) { return i.id === d.id; });
    if (!it) return;
    if (info.fixed) { it.start = U.toMin(v); it.end = it.start + it.dur; Sch.markConflicts(info.day.items); Sch.sortItems(info.day.items); }
    else state.overrides[it.refId + '|' + d.date] = { time: v };
    closeAll(); Store.save(state); toast('Áthelyezve: ' + v + '.');
  };
  A.addToday = function (d) {
    var a = Sch.act(state, d.id); if (!a) return;
    var it = Sch.addToDay(state, U.today(), a);
    ui.toast = null; commit();
    toast(it && it.start != null ? 'Bekerült a mai napba, ' + U.toHM(it.start) + '-kor.' : 'Bekerült, de ma nem találtam neki helyet.');
  };
  A.calMonth = function (d) {
    var m = (ui.cal.month || U.today().slice(0, 7)).split('-').map(Number);
    var nd = new Date(m[0], m[1] - 1 + (+d.d), 1);
    ui.cal.month = U.ymd(nd).slice(0, 7);
    render();
  };
  A.calSel = function (d) { ui.cal.sel = d.d; ui.cal.month = d.d.slice(0, 7); render(); };
  A.calTomorrow = function () { closeAll(); ui.tab = 'cal'; var tm = U.addDays(U.today(), 1); ui.cal.sel = tm; ui.cal.month = tm.slice(0, 7); render(); };
  A.notesTab = function (d) { ui.notes = d.t; render(); };
  A.ideaF = function (d) { ui.ideaF = d.f; render(); };
  A.trF = function (d) { ui.trF = d.f; render(); };
  A.res = function (d) { ui.res = +d.n; render(); };
  A.toggleGot = function () { ui.showGot = !ui.showGot; render(); };
  A.toggleDone = function () { ui.showDone = !ui.showDone; render(); };
  A.togglePast = function () { ui.showPast = !ui.showPast; render(); };
  A.toggleArch = function () { ui.showArch = !ui.showArch; render(); };
  A.ideasOf = function (d) { closeAll(); ui.tab = 'notes'; ui.notes = 'ideas'; ui.ideaF = d.id; render(); };
  A.mic = mic;
  A.saveIdea = function () {
    var q = ui.q, body = (q.body || '').trim(), title = (q.title || '').trim();
    if (!title && !body) { toast('Írj vagy mondj be valamit.'); return; }
    if (!title) title = body.split(/\s+/).slice(0, 6).join(' ') + (body.split(/\s+/).length > 6 ? '…' : '');
    if (rec && ui.listening) rec.stop();
    state.ideas.push({ id: U.uid(), title: title, body: body, projectId: q.proj || null, dictated: !!q.dictated, createdAt: Date.now() });
    ui.q = { title: '', body: '', proj: q.proj, dictated: false };
    commit(); toast('Ötlet elmentve.');
  };
  A.saveIdeaEdit = function () {
    var d = ui.sheet.draft, i = state.ideas.find(function (x) { return x.id === ui.sheet.id; });
    if (!i) return;
    i.title = (d.title || '').trim() || i.title; i.body = d.body || ''; i.projectId = d.projectId || null;
    closeSheet(); commit();
  };
  A.delIdea = function () {
    if (!confirm('Biztosan törlöd ezt az ötletet?')) return;
    state.ideas = state.ideas.filter(function (x) { return x.id !== ui.sheet.id; });
    closeSheet(); commit();
  };
  A.saveTreasure = function () {
    var d = ui.sheet.draft;
    if (!(d.title || '').trim()) { toast('Adj neki nevet.'); return; }
    var obj = { title: d.title.trim(), type: d.type, seen: (d.seen || '').trim(), buy: (d.buy || '').trim(), link: (d.link || '').trim(), date: d.date || null, got: !!d.got };
    if (d.id) Object.assign(state.treasures.find(function (x) { return x.id === d.id; }), obj);
    else state.treasures.push(Object.assign({ id: U.uid(), createdAt: Date.now() }, obj));
    closeSheet(); commit(); toast(obj.date ? 'Elmentve. ' + U.cap(U.onDay(obj.date)) + ' szólok.' : 'Elmentve a Kincsesládába.');
  };
  A.delTreasure = function () {
    if (!confirm('Biztosan törlöd?')) return;
    state.treasures = state.treasures.filter(function (x) { return x.id !== ui.sheet.draft.id; });
    closeSheet(); commit();
  };
  A.saveWeight = function () {
    var d = ui.sheet.draft, v = U.parseNum(d.v);
    if (v == null || !d.date) { toast('Add meg a napot és a testsúlyt.'); return; }
    (state.metricLogs[d.date] = state.metricLogs[d.date] || {}).m_weight = v;
    closeSheet(); commit(); toast('Mérés elmentve.');
  };
  A.saveEntry = function () {
    var d = ui.sheet.draft;
    if (!(d.title || '').trim()) { toast('Adj neki címet.'); return; }
    var p = Sch.proj(state, d.projectId);
    if (d.mode === 'event') {
      if (!d.date) { toast('Válassz napot.'); return; }
      if (!d.allDay && !d.start) { toast('Add meg, mikor kezdődik.'); return; }
      var ev = d.editId ? state.events.find(function (x) { return x.id === d.editId; }) : { id: U.uid() };
      var endTxt = d.end || U.toInputTime(U.toMin(d.start) + 60);
      if (!d.allDay && U.toMin(endTxt) <= U.toMin(d.start)) endTxt = U.toInputTime(U.toMin(d.start) + 60);
      Object.assign(ev, { title: d.title.trim(), date: d.date, start: d.allDay ? null : d.start, end: d.allDay ? null : endTxt, allDay: !!d.allDay, travel: parseInt(d.travel, 10) || 0, catId: d.catId || (p && p.catId) || null, projectId: d.projectId || null, note: d.note || '' });
      if (!d.editId) state.events.push(ev);
      Object.keys(d.res || {}).forEach(function (id) { if (d.res[id]) Sch.resolve(state, d.date, id, d.res[id]); });
      closeSheet(); commit(); toast(d.editId ? 'Esemény frissítve.' : 'Bekerült a naptárba: ' + U.fmtLong(d.date) + '.');
    } else {
      var t = d.editId ? state.tasks.find(function (x) { return x.id === d.editId; }) : { id: U.uid(), done: false, pushes: 0, createdAt: Date.now() };
      Object.assign(t, { title: d.title.trim(), date: d.date || null, projectId: d.projectId || null, catId: d.catId || (p && p.catId) || null });
      if (!d.editId) state.tasks.push(t);
      closeSheet(); commit(); toast(d.editId ? 'Feladat frissítve.' : 'Feladat elmentve.');
    }
  };
  A.delEntry = function () {
    var d = ui.sheet.draft;
    if (!confirm('Biztosan törlöd?')) return;
    if (d.mode === 'event') state.events = state.events.filter(function (x) { return x.id !== d.editId; });
    else state.tasks = state.tasks.filter(function (x) { return x.id !== d.editId; });
    closeAll(); commit(); toast('Törölve.');
  };
  A.saveProj = function () {
    var d = ui.sheet.draft, t = U.today();
    if (!(d.name || '').trim()) { toast('Adj nevet a projektnek.'); return; }
    if (!d.catId) { toast('Válassz kategóriát.'); return; }
    var isNew = !d.id;
    var p = isNew ? { id: 'p_' + U.uid(), createdAt: Date.now() } : Sch.proj(state, d.id);
    p.name = d.name.trim(); p.catId = d.catId; p.kind = d.kind; p.note = d.note || '';
    var keep = {}, created = [];
    if (d.kind === 'collection') {
      p.goal = { type: 'none' }; p.deadline = null; p.countdown = false;
    } else {
      p.goal = { type: d.goalType };
      if (d.goalType === 'quantity') { p.goal.target = U.parseNum(d.target); p.goal.unit = (d.unit || '').trim(); p.goal.start = U.parseNum(d.start) || 0; }
      p.deadline = d.hasDeadline && d.deadline ? d.deadline : null;
      p.countdown = !!(p.deadline && d.countdown);
      d.acts.forEach(function (a) {
        if (a.type === 'none') return;
        var ex = a.id ? Sch.act(state, a.id) : null;
        var sched = { type: a.type, days: a.days.slice(), n: Math.max(2, parseInt(a.n, 10) || 2), quota: Math.max(1, parseInt(a.quota, 10) || 1) };
        if (a.type === 'every') sched.anchor = ex && ex.sched.type === 'every' && ex.sched.anchor ? ex.sched.anchor : t;
        var obj = ex || { id: 'a_' + U.uid(), projectId: p.id, startDate: t };
        Object.assign(obj, { title: (a.title || '').trim() || p.name, sched: sched, time: a.time || null, dur: Math.max(5, parseInt(a.dur, 10) || 30), important: !!a.important, habit: !!a.habit });
        if (!ex) { state.activities.push(obj); created.push(obj); }
        keep[obj.id] = 1;
      });
    }
    var removed = {};
    state.activities = state.activities.filter(function (a) { if (a.projectId === p.id && !keep[a.id]) { removed[a.id] = 1; return false; } return true; });
    removeActsFromDays(removed);
    // Napi szám
    var firstAct = state.activities.find(function (a) { return a.projectId === p.id; });
    var m = d.metricId ? state.metrics.find(function (x) { return x.id === d.metricId; }) : null;
    if (d.kind !== 'collection' && d.metricOn) {
      if (!m) { m = { id: 'm_' + U.uid(), projectId: p.id, mode: 'daily', doneWhen: 'any', projectMetric: true }; state.metrics.push(m); }
      m.name = (d.metricName || '').trim() || p.name; m.unit = (d.metricUnit || '').trim(); m.target = U.parseNum(d.metricTarget);
      m.activityId = firstAct ? firstAct.id : null;
      if (p.goal.type === 'quantity') p.goal.metricId = m.id;
    } else if (m) {
      state.metrics = state.metrics.filter(function (x) { return x.id !== m.id; });
      if (p.goal && p.goal.metricId === m.id) p.goal.metricId = null;
    }
    if (isNew) state.projects.push(p);
    ui.stack = []; ui.sheet = { type: 'proj', id: p.id };
    Store.save(state); render();
    // Ma is bekerüljön? Ütközik-e valahol a következő héten?
    var dueToday = created.find(function (a) { return Sch.isDue(state, a, t) && state.days[t] && !state.days[t].items.some(function (i) { return i.refId === a.id; }); });
    var clash = null;
    for (var k = 1; k <= 7 && !clash; k++) {
      var dd = U.addDays(t, k);
      var its = Sch.getDay(state, dd).items;
      var hit = its.find(function (i) { return i.conflict && i.projectId === p.id; });
      if (hit) clash = { date: dd, it: hit };
    }
    if (clash) toast(U.cap(U.relDay(clash.date)) + ' ütközik: ' + clash.it.title + '. A Naptárban rendezheted.');
    else if (dueToday) toast('Holnaptól ott lesz a napodban.', 'addToday', dueToday.id, 'Mára is');
    else toast(isNew ? 'Projekt elmentve.' : 'Változások elmentve.');
  };
  A.delProj = function (d) {
    var p = Sch.proj(state, d.id);
    if (!p || !confirm('Törlöd: ' + p.name + '? Az ütemezései is törlődnek; az események, feladatok és ötletek megmaradnak projekt nélkül.')) return;
    var removed = {};
    state.activities = state.activities.filter(function (a) { if (a.projectId === p.id) { removed[a.id] = 1; return false; } return true; });
    removeActsFromDays(removed);
    state.metrics = state.metrics.filter(function (m) { return m.projectId !== p.id; });
    ['events', 'tasks', 'ideas'].forEach(function (k) { state[k].forEach(function (x) { if (x.projectId === p.id) x.projectId = null; }); });
    state.projects = state.projects.filter(function (x) { return x.id !== p.id; });
    closeAll(); commit(); toast('Projekt törölve.');
  };
  A.archiveProj = function (d) {
    var p = Sch.proj(state, d.id); if (!p) return;
    p.archived = !p.archived;
    state.activities.forEach(function (a) { if (a.projectId === p.id) a.paused = p.archived; });
    if (p.archived) { var r = {}; state.activities.forEach(function (a) { if (a.projectId === p.id) r[a.id] = 1; }); removeActsFromDays(r); }
    closeAll(); commit(); toast(p.archived ? 'Archiválva.' : 'Visszaállítva.');
  };
  A.saveCat = function () {
    var d = ui.sheet.draft;
    if (!(d.name || '').trim()) { toast('Adj nevet a kategóriának.'); return; }
    var c = { id: 'c_' + U.uid(), name: d.name.trim(), color: d.color, icon: 'dot' };
    state.categories.push(c);
    ui.sheet = ui.stack.pop() || null;
    if (ui.sheet && ui.sheet.draft && 'catId' in ui.sheet.draft) ui.sheet.draft.catId = c.id;
    commit();
  };
  A.catColor = function (d) { var c = Sch.cat(state, d.id); if (c) { c.color = d.c; commit(); } };
  A.screenOk = function (d) { var day = state.days[U.today()]; if (day) { day.screenOk = d.v === '1'; commit(); } };
  A.closeDay = function () {
    var day = state.days[U.today()]; if (day) day.closed = true;
    closeAll(); commit(); toast('Jó éjszakát.');
  };
  A.backup = doBackup;
  A.update = function () { if (ui.update) ui.update.postMessage({ type: 'skip' }); };
  A.resetAll = function () {
    if (!confirm('Minden adatot törölsz ezen a telefonon. Előtte érdemes mentést készíteni. Folytatod?')) return;
    if (!confirm('Biztosan? Ez nem vonható vissza.')) return;
    state = Store.seed(); Store.saveNow(state); ui.day = null; closeAll(); ensureToday(); ui.tab = 'ma'; render();
  };

  /* ---------- Változásfigyelők ---------- */
  var CH = {};
  CH.metric = function (el) {
    var d = el.dataset, v = U.parseNum(el.value);
    var logs = state.metricLogs[d.date] = state.metricLogs[d.date] || {};
    if (v == null) delete logs[d.id]; else logs[d.id] = v;
    var m = state.metrics.find(function (x) { return x.id === d.id; });
    if (m) metricAutoDone(m, v, d.date);
    commit();
  };
  CH.setting = function (el) {
    var k = el.dataset.k;
    state.settings[k] = k === 'weighDay' ? parseInt(el.value, 10) : el.value;
    commit();
  };
  CH.catName = function (el) { var c = Sch.cat(state, el.dataset.id); if (c && el.value.trim()) { c.name = el.value.trim(); commit(); } };
  CH.import = function (el) {
    var f = el.files && el.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var s = Store.parseImport(r.result);
        if (!confirm('A mentés felülírja a mostani adatokat ezen a telefonon. Folytatod?')) return;
        state = s; Store.saveNow(state); ui.day = null; closeAll(); ensureToday(); ui.tab = 'ma'; render(); toast('Visszaállítva a mentésből.');
      } catch (e) { toast(e.message && /Callan/.test(e.message) ? e.message : 'Ezt a fájlt nem tudom beolvasni. Callan-mentést válassz.'); }
    };
    r.readAsText(f);
  };

  function bind() {
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-a]');
      if (!el || !root.contains(el)) return;
      var fn = A[el.dataset.a];
      if (fn) { e.preventDefault(); fn(el.dataset, el); }
    });
    root.addEventListener('input', function (e) {
      var el = e.target;
      if (el.dataset.bind && ui.sheet && ui.sheet.draft) setPath(ui.sheet.draft, el.dataset.bind, el.value);
      else if (el.dataset.bindui) setPath(ui, el.dataset.bindui, el.value);
    });
    root.addEventListener('change', function (e) {
      var el = e.target;
      if (el.dataset.change && CH[el.dataset.change]) CH[el.dataset.change](el);
      else if (el.dataset.rerender) {
        if (el.dataset.bind && ui.sheet && ui.sheet.draft) setPath(ui.sheet.draft, el.dataset.bind, el.value);
        render();
      }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('num-input')) e.target.blur();
      if (e.key === 'Escape' && ui.sheet) closeSheet();
    });
  }

  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (reloading) return; reloading = true; Store.flush(state).then(function () { location.reload(); }); });
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      function ready(w) { ui.update = w; render(); }
      if (reg.waiting && navigator.serviceWorker.controller) ready(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) ready(w); });
      });
      document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () { }); });
    }).catch(function () { /* helyi fájlként megnyitva nincs service worker */ });
  }

  function tick() {
    ensureToday();
    if (!ui.sheet && ui.tab === 'ma' && !isTyping()) render();
  }

  function init() {
    root = document.getElementById('app');
    Store.load().then(function (s) {
      state = s;
      CA._state = function () { return state; };
      ensureToday();
      render();
      bind();
      Store.persist().then(function (p) { ui.persisted = !!p; });
      registerSW();
      setInterval(tick, 60000);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) Store.flush(state);
        else { ensureToday(); if (!isTyping()) render(); }
      });
      window.addEventListener('pagehide', function () { Store.flush(state); });
    });
  }
  CA.start = init;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
