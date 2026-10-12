/* Push értesítések az ntfy szolgáltatáson keresztül.
   Callan előre beütemezi az emlékeztetőket az ntfy.sh szerveren (legfeljebb 3 nappal előre),
   a telefonon az ntfy app jeleníti meg őket – akkor is, ha Callan be van zárva.
   Minden emlékeztetőnek állandó azonosítója (sequence ID) van: ha az esemény változik,
   ugyanazzal az azonosítóval újraküldjük (ez lecseréli), ha megszűnik, töröljük. */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util, Sch = CA.sched;
  var N = CA.notify = {};
  var HOST = 'https://ntfy.sh';
  N.HOST = HOST;
  var HORIZON = 72 * 3600 - 15 * 60;    // a szerver 3 napot enged, egy kis ráhagyással
  var MIN_AHEAD = 30;                   // ennél közelebbit már nem ütemezünk
  var KEEPALIVE_EVERY = 6 * 3600;

  N.EVENT_OPTS = [['none', 'Nincs'], ['0', 'Kezdéskor'], ['10', '10 perccel előtte'], ['30', '30 perccel előtte'], ['60', '1 órával előtte'], ['120', '2 órával előtte'], ['1440', '1 nappal előtte']];
  N.ALLDAY_OPTS = [['none', 'Nincs'], ['morning', 'Aznap reggel'], ['evening', 'Előző este']];
  N.TASK_TIME_OPTS = [['none', 'Nincs'], ['0', 'Pontosan akkor'], ['10', '10 perccel előtte'], ['30', '30 perccel előtte'], ['60', '1 órával előtte'], ['morning', 'Aznap reggel']];
  N.TASK_DAY_OPTS = [['none', 'Nincs'], ['morning', 'Aznap reggel']];
  N.TASK_DUE_OPTS = [['none', 'Nincs'], ['morning', 'Határidő napján reggel'], ['both', 'Előző nap és aznap reggel']];

  function valid(opts, v) { return opts.some(function (o) { return o[0] === v; }); }
  /* Az eseményhez/feladathoz tartozó választás (ha nincs megadva, az alapértelmezés). */
  N.remindValue = function (kind, obj, draft) {
    var o = draft || obj || {};
    var r = o.remind;
    var opts, def;
    if (kind === 'event') {
      if (o.allDay) { opts = N.ALLDAY_OPTS; def = 'morning'; } else { opts = N.EVENT_OPTS; def = '30'; }
    } else if ((o.tmode || o.mode) === 'due') { opts = N.TASK_DUE_OPTS; def = 'both'; }
    else if (o.time) { opts = N.TASK_TIME_OPTS; def = '10'; }
    else { opts = N.TASK_DAY_OPTS; def = 'none'; }
    var v = r === undefined ? def : (r === null ? 'none' : String(r));
    if (!valid(opts, v)) v = def;
    return { value: v, opts: opts };
  };
  N.parseRemind = function (v) {
    if (v === 'none') return null;
    if (/^\d+$/.test(v)) return +v;
    return v;
  };

  N.newTopic = function () {
    var abc = 'abcdefghijkmnpqrstuvwxyz23456789', out = 'callan_', buf = new Uint8Array(22);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < buf.length; i++) out += abc[buf[i] % abc.length];
    return out;
  };

  function epoch(date, min) { var d = U.parse(date); d.setMinutes(min); return Math.floor(d.getTime() / 1000); }
  function hm(m) { return U.toHM(m); }
  function rel(r) {
    if (r < 60) return r + ' perc múlva';
    if (r % 60 === 0) return (r / 60) + ' óra múlva';
    return U.num(r / 60, 1) + ' óra múlva';
  }
  function hrs(m) { return U.num(m / 60, 1) + ' óra'; }
  function clip(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function safe(id) { return String(id).replace(/[^-_A-Za-z0-9]/g, '').slice(0, 40); }

  /* A következő 3 nap kívánt emlékeztetői. */
  N.desired = function (state, nowSec) {
    var st = state.settings, out = [];
    var today = U.today(), from = U.addDays(today, -1), to = U.addDays(today, 4);
    var wake = U.toMin(st.wake) || 480, ws = U.toMin(st.workStart) || 540;
    function add(seq, at, title, msg, prio) {
      if (at < nowSec + MIN_AHEAD || at > nowSec + HORIZON) return;
      out.push({ seq: seq, at: at, title: clip(title, 120), message: clip(msg, 600), priority: prio || 4 });
    }
    state.events.forEach(function (e) {
      if (!e.date || e.date < from || e.date > to) return;
      var rv = N.remindValue('event', e).value;
      if (rv === 'none') return;
      var seq = 'e-' + safe(e.id);
      if (e.allDay) {
        if (rv === 'morning') add(seq, epoch(e.date, wake), e.title, 'Ma egész napos esemény.' + (e.note ? '\n' + e.note : ''));
        else add(seq, epoch(U.addDays(e.date, -1), 20 * 60), e.title, 'Holnap egész napos esemény.' + (e.note ? '\n' + e.note : ''));
        return;
      }
      var s = U.toMin(e.start); if (s == null) return;
      var r = +rv, trav = e.travel || 0, base = s - trav, msg;
      if (r === 1440) msg = 'Holnap ' + hm(s) + '-kor kezdődik.' + (trav ? ' Indulás ' + hm(base) + '-kor.' : '');
      else if (trav) msg = (r === 0 ? 'Most kell indulnod' : 'Indulás ' + rel(r)) + ' (' + hm(base) + '), kezdés ' + hm(s) + '-kor.';
      else msg = r === 0 ? 'Most kezdődik (' + hm(s) + ').' : rel(r) + ', ' + hm(s) + '-kor kezdődik.';
      if (e.note) msg += '\n' + e.note;
      add(seq, epoch(e.date, base - r), e.title, U.cap(msg));
    });
    state.tasks.forEach(function (t) {
      if (t.done) return;
      var rv = N.remindValue('task', t).value;
      if (rv === 'none') return;
      var seq = 'k-' + safe(t.id);
      if (t.mode === 'due') {
        if (!t.due) return;
        var left = Sch.taskRemaining(t), tail = t.est ? ' Még ' + hrs(left) + ' van hátra belőle.' : '';
        add(seq + '-0', epoch(t.due, ws), t.title, 'Ma jár le a határideje.' + tail, 4);
        if (rv === 'both') add(seq + '-1', epoch(U.addDays(t.due, -1), ws), t.title, 'Holnap jár le a határideje.' + tail, 3);
        return;
      }
      if (!t.date) return;
      if (rv === 'morning') { add(seq, epoch(t.date, wake), t.title, 'Mai teendő.' + (t.time ? ' ' + t.time + '-ra tervezted.' : '') + (t.est ? ' Kb. ' + U.dur(t.est) + '.' : ''), 3); return; }
      var tm = U.toMin(t.time); if (tm == null) return;
      var rr = +rv;
      add(seq, epoch(t.date, tm - rr), t.title, rr === 0 ? 'Most esedékes (' + hm(tm) + ').' : U.cap(rel(rr)) + ', ' + hm(tm) + '-kor esedékes.');
    });
    return out;
  };

  function sig(d) { var s = d.at + '|' + d.title + '|' + d.message, h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
  function appUrl() { return location.origin + location.pathname.replace(/index\.html$/, ''); }

  function post(body) {
    // Fejléc nélküli kérés: a böngésző így nem küld előzetes CORS-kérést.
    return fetch(HOST + '/', { method: 'POST', body: JSON.stringify(body) }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  }
  function del(topic, seq) {
    return fetch(HOST + '/' + topic + '/' + seq, { method: 'DELETE' }).then(function (r) {
      if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status);
      return r;
    });
  }
  function payload(topic, d) {
    var b = { topic: topic, title: d.title, message: d.message, tags: ['dragon_face'], priority: d.priority || 4, click: appUrl(), icon: appUrl() + 'icons/icon-192.png' };
    if (d.seq) b.sequence_id = d.seq;
    if (d.at) b.delay = String(d.at);
    return b;
  }

  N.test = function (state) {
    var n = state.settings.notify;
    if (!n.topic) return Promise.reject(new Error('Nincs témanév.'));
    return post(payload(n.topic, { title: 'Callan', message: 'Működik. Innentől itt szólok az eseményeidről és a határidőidről.' }));
  };

  var running = null;
  /* Összeveti a kívánt és a már beütemezett emlékeztetőket, és csak a különbséget küldi el. */
  N.sync = function (state, opts) {
    if (running) return running;
    opts = opts || {};
    var n = state.settings.notify, sent = state.notifySent = state.notifySent || {};
    var now = Math.floor(Date.now() / 1000);
    var jobs = [], changed = false;
    if (!n.on || !n.topic) {
      var topic = opts.topic || n.topic;
      Object.keys(sent).forEach(function (seq) {
        if (sent[seq].at > now + 5 && topic) jobs.push(function () { return del(topic, seq).then(function () { delete sent[seq]; changed = true; }); });
        else { delete sent[seq]; changed = true; }
      });
      if (topic && n.keepaliveAt) jobs.push(function () { return del(topic, 'callan-keepalive').then(function () { n.keepaliveAt = 0; changed = true; }); });
    } else {
      var want = {};
      N.desired(state, now).forEach(function (d) { want[d.seq] = d; });
      Object.keys(want).forEach(function (seq) {
        var d = want[seq], g = sig(d);
        if (sent[seq] && sent[seq].sig === g) return;
        jobs.push(function () { return post(payload(n.topic, d)).then(function () { sent[seq] = { at: d.at, sig: g }; changed = true; }); });
      });
      Object.keys(sent).forEach(function (seq) {
        if (want[seq]) return;
        if (sent[seq].at <= now + 5) { delete sent[seq]; changed = true; return; }
        // Ha csak kiesett az ablakból (3 napnál messzebbre került), hagyjuk; különben törlés.
        jobs.push(function () { return del(n.topic, seq).then(function () { delete sent[seq]; changed = true; }); });
      });
      if (opts.force || now - (n.keepaliveAt || 0) > KEEPALIVE_EVERY) {
        jobs.push(function () {
          return post(payload(n.topic, { seq: 'callan-keepalive', at: now + 70 * 3600, title: 'Callan', message: 'Pár napja nem néztél be. Nyisd meg Callant, hogy a következő napok emlékeztetői is megérkezzenek.', priority: 3 }))
            .then(function () { n.keepaliveAt = now; changed = true; });
        });
      }
    }
    jobs = jobs.slice(0, 50); // a szerver egyszerre 60 kérést enged
    running = jobs.reduce(function (p, job) { return p.then(job); }, Promise.resolve()).then(function () {
      n.lastSync = Date.now(); n.lastError = null;
      return { ok: true, changed: changed || jobs.length > 0 };
    }).catch(function (e) {
      n.lastError = (e && e.message) || 'hálózati hiba';
      return { ok: false, changed: true, error: n.lastError };
    }).then(function (r) { running = null; return r; });
    return running;
  };

  N.pending = function (state) {
    var now = Math.floor(Date.now() / 1000), sent = state.notifySent || {};
    return Object.keys(sent).filter(function (k) { return sent[k].at > now; }).length;
  };
})();
