/* Adattárolás: IndexedDB (tartalék: localStorage), kezdő adatok, verzióváltás, mentés. */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util;
  var DB = 'callan', OS = 'kv', KEY = 'state', LS_KEY = 'callan-state';
  var SCHEMA = 1;
  var S = CA.store = { SCHEMA: SCHEMA };

  function openDB() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('no idb'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(OS); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbGet() {
    return openDB().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(OS, 'readonly').objectStore(OS).get(KEY);
        t.onsuccess = function () { res(t.result || null); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function idbPut(val) {
    return openDB().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(OS, 'readwrite');
        tx.objectStore(OS).put(val, KEY);
        tx.oncomplete = function () { res(); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }

  S.load = function () {
    return idbGet().catch(function () { return null; }).then(function (s) {
      if (!s) {
        try { var raw = localStorage.getItem(LS_KEY); if (raw) s = JSON.parse(raw); } catch (e) { s = null; }
      }
      if (!s) { s = S.seed(); S.saveNow(s); }
      return S.migrate(s);
    });
  };

  var timer = null;
  S.save = function (state) {
    clearTimeout(timer);
    timer = setTimeout(function () { S.saveNow(state); }, 250);
  };
  S.saveNow = function (state) {
    var copy = JSON.parse(JSON.stringify(state));
    return idbPut(copy).catch(function () {
      try { localStorage.setItem(LS_KEY, JSON.stringify(copy)); } catch (e) { /* tele a tároló */ }
    });
  };
  S.flush = function (state) { clearTimeout(timer); return S.saveNow(state); };

  S.persist = function () {
    if (navigator.storage && navigator.storage.persist) {
      return navigator.storage.persisted().then(function (p) { return p || navigator.storage.persist(); }).catch(function () { return false; });
    }
    return Promise.resolve(false);
  };

  /* Későbbi verziók itt alakítják át a régi adatokat, sosem dobják el őket. */
  S.migrate = function (s) {
    s.v = s.v || 1;
    // if (s.v < 2) { ...; s.v = 2; }
    ['categories', 'projects', 'activities', 'metrics', 'events', 'tasks', 'ideas', 'treasures'].forEach(function (k) { if (!Array.isArray(s[k])) s[k] = []; });
    ['metricLogs', 'days', 'overrides'].forEach(function (k) { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
    s.settings = Object.assign(S.defaultSettings(), s.settings || {});
    return s;
  };

  S.defaultSettings = function () {
    return { wake: '08:00', workStart: '09:00', workEnd: '18:00', lunch: '13:00', lunchLen: 45, screenCut: '21:00', weighDay: 6, lastBackup: null };
  };

  S.PALETTE = ['#4F6B63', '#846044', '#96604F', '#6F7A5A', '#A07845', '#8C6E78', '#6A7A8C', '#7C6A55', '#5E6E4E', '#9A7A60'];

  S.seed = function () {
    var t = U.today();
    var WD = [0, 1, 2, 3, 4], ALL = [0, 1, 2, 3, 4, 5, 6];
    function act(id, projectId, title, sched, time, dur, extra) {
      return Object.assign({ id: id, projectId: projectId, title: title, sched: sched, time: time, dur: dur, important: false, habit: false, startDate: t }, extra || {});
    }
    return {
      v: SCHEMA,
      createdAt: new Date().toISOString(),
      settings: S.defaultSettings(),
      categories: [
        { id: 'home', name: 'Home office', color: '#4F6B63', icon: 'home' },
        { id: 'fires', name: 'Little Fires', color: '#846044', icon: 'fires' },
        { id: 'write', name: 'Írói munka', color: '#96604F', icon: 'write' },
        { id: 'grow', name: 'Személyes fejlődés', color: '#6F7A5A', icon: 'grow' },
        { id: 'hobby', name: 'Hobbi', color: '#A07845', icon: 'hobby' },
        { id: 'family', name: 'Család', color: '#8C6E78', icon: 'family' }
      ],
      projects: [
        { id: 'p_trade', name: 'Tradevance Kft.', catId: 'home', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_pod', name: 'Marketing podcast', catId: 'home', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_lf', name: 'Little Fires újraindítás', catId: 'fires', kind: 'goal', goal: { type: 'milestones' }, deadline: null, countdown: false },
        { id: 'p_novel', name: 'Regény', catId: 'write', kind: 'goal', goal: { type: 'quantity', target: null, unit: 'szó', start: 0, metricId: 'm_words' }, deadline: null, countdown: false },
        { id: 'p_stories', name: 'Új sztorik', catId: 'write', kind: 'collection', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_job', name: 'Munkakeresés', catId: 'grow', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_fit', name: 'Fogyás', catId: 'grow', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_cn', name: 'Kínai', catId: 'grow', kind: 'goal', goal: { type: 'none' }, deadline: '2027-04-15', countdown: true, countdownLabel: 'Kínai út' },
        { id: 'p_house', name: 'Házimunka', catId: 'grow', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_read', name: 'Olvasás', catId: 'hobby', kind: 'goal', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_relax', name: 'Kikapcsolódás', catId: 'hobby', kind: 'collection', goal: { type: 'none' }, deadline: null, countdown: false },
        { id: 'p_mom', name: 'MomLife', catId: 'family', kind: 'collection', goal: { type: 'none' }, deadline: null, countdown: false }
      ],
      activities: [
        act('a_write', 'p_novel', 'Írás', { type: 'daily', days: WD }, '09:00', 120, { important: true, habit: true, metricId: 'm_words' }),
        act('a_lf', 'p_lf', 'Little Fires', { type: 'daily', days: WD }, '11:15', 75, { important: true }),
        act('a_cn', 'p_cn', 'Kínai', { type: 'daily', days: ALL }, '12:30', 30, { habit: true }),
        act('a_job', 'p_job', 'Jelentkezések', { type: 'every', n: 2, days: WD, anchor: t }, '14:00', 60, { important: true, metricId: 'm_apps' }),
        act('a_trade', 'p_trade', 'Hirdetésmenedzsment', { type: 'quota', quota: 1, days: WD }, null, 60, { important: true }),
        act('a_walk', 'p_fit', 'Séta a gyaloglópadon', { type: 'daily', days: ALL }, '16:30', 30, { habit: true, metricId: 'm_walk' }),
        act('a_pil', 'p_fit', 'Pilates', { type: 'every', n: 2, days: ALL, anchor: t }, '17:00', 45, { habit: true }),
        act('a_house', 'p_house', 'Házimunka', { type: 'daily', days: ALL }, '18:30', 30, { habit: true }),
        act('a_read', 'p_read', 'Olvasás', { type: 'daily', days: ALL }, '19:30', 45, { habit: true })
      ],
      metrics: [
        { id: 'm_words', name: 'Szószám', unit: 'szó', target: 1000, mode: 'daily', projectId: 'p_novel', activityId: 'a_write', doneWhen: 'any', projectMetric: true },
        { id: 'm_kcal', name: 'Kalória', unit: 'kcal', target: null, mode: 'daily', projectId: 'p_fit', activityId: null, doneWhen: 'any' },
        { id: 'm_walk', name: 'Séta', unit: 'perc', target: 30, mode: 'daily', projectId: 'p_fit', activityId: 'a_walk', doneWhen: 'target' },
        { id: 'm_apps', name: 'Beadott jelentkezés', unit: 'db', target: null, mode: 'daily', projectId: 'p_job', activityId: 'a_job', doneWhen: 'any', projectMetric: true },
        { id: 'm_weight', name: 'Testsúly', unit: 'kg', target: null, mode: 'weekly', projectId: 'p_fit', activityId: null, doneWhen: 'any' }
      ],
      metricLogs: {},
      events: [],
      tasks: [],
      overrides: {},
      days: {},
      ideas: [],
      treasures: []
    };
  };

  S.exportBlob = function (state) {
    var data = JSON.stringify({ app: 'callan', exportedAt: new Date().toISOString(), state: state }, null, 1);
    return new Blob([data], { type: 'application/json' });
  };
  S.parseImport = function (text) {
    var obj = JSON.parse(text);
    var st = obj && obj.app === 'callan' ? obj.state : obj;
    if (!st || !Array.isArray(st.projects) || !st.settings) throw new Error('Ez a fájl nem Callan-mentés.');
    return S.migrate(st);
  };
})();
