/* Ütemező: mikor esedékes egy tevékenység, hogyan áll össze egy nap, ütközések, sorozatok. */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util;
  var Sch = CA.sched = {};
  var ALL = [0, 1, 2, 3, 4, 5, 6];
  var LEISURE = { hobby: true, family: true };

  Sch.proj = function (state, id) { return state.projects.find(function (p) { return p.id === id; }) || null; };
  Sch.cat = function (state, id) { return state.categories.find(function (c) { return c.id === id; }) || null; };
  Sch.act = function (state, id) { return state.activities.find(function (a) { return a.id === id; }) || null; };
  Sch.catColor = function (state, id) { var c = Sch.cat(state, id); return c ? c.color : '#8C7A69'; };

  function days(a) { var d = a.sched && a.sched.days; return d && d.length ? d : ALL; }
  function allowed(a, dw) { return days(a).indexOf(dw) >= 0; }
  function countAllowed(a, from, to) { // [from, to)
    var n = U.diffDays(from, to);
    if (n <= 0) return 0;
    var ds = days(a), weeks = Math.floor(n / 7), c = weeks * ds.length, sd = U.dow(from);
    for (var i = 0; i < n % 7; i++) if (ds.indexOf((sd + i) % 7) >= 0) c++;
    return c;
  }

  function quotaPlan(a, date) {
    var ws = U.weekStart(date), L = [];
    for (var i = 0; i < 7; i++) {
      var d = U.addDays(ws, i);
      if (allowed(a, i) && (!a.startDate || d >= a.startDate)) L.push(d);
    }
    var k = Math.min(Math.max(1, a.sched.quota || 1), L.length), P = [];
    for (var j = 0; j < k; j++) P.push(L[Math.floor(j * L.length / k)]);
    return { L: L, P: P, k: Math.max(1, a.sched.quota || 1) };
  }
  function doneOn(state, aid, d) {
    var day = state.days[d];
    return !!(day && day.items.some(function (i) { return i.refId === aid && i.done; }));
  }
  function plannedOn(state, aid, d) {
    var day = state.days[d];
    return !!(day && day.items.some(function (i) { return i.refId === aid; }));
  }

  Sch.quotaStatus = function (state, a, date) {
    var q = quotaPlan(a, date || U.today()), done = 0;
    q.L.forEach(function (d) { if (doneOn(state, a.id, d)) done++; });
    return { done: done, k: q.k };
  };

  Sch.isDue = function (state, a, date) {
    if (!a || a.paused || !a.sched) return false;
    if (a.startDate && date < a.startDate) return false;
    var s = a.sched, dw = U.dow(date), today = U.today();
    if (s.type === 'daily' || s.type === 'weekdays') return allowed(a, dw);
    if (s.type === 'every') {
      if (!allowed(a, dw)) return false;
      var anchor = s.anchor || a.startDate || date;
      if (date < anchor) return false;
      return countAllowed(a, anchor, date) % Math.max(1, s.n || 2) === 0;
    }
    if (s.type === 'quota') {
      if (date < today) return plannedOn(state, a.id, date);
      var q = quotaPlan(a, date);
      if (q.L.indexOf(date) < 0) return false;
      var done = 0, plannedBefore = 0;
      q.L.forEach(function (d) { if (d < date && doneOn(state, a.id, d)) done++; });
      q.P.forEach(function (d) { if (d < date) plannedBefore++; });
      if (done >= q.k) return false;
      if (q.P.indexOf(date) >= 0) return true;
      return date === today && done < plannedBefore; // elmaradt alkalom pótlása
    }
    return false;
  };

  Sch.describe = function (a) {
    var s = a.sched || {};
    var ds = days(a);
    var dayTxt = ds.length === 7 ? '' : (ds.join(',') === '0,1,2,3,4' ? 'hétköznap' : ds.length === 2 && ds.join(',') === '5,6' ? 'hétvégén' : ds.map(function (d) { return U.DAYS_SHORT[d]; }).join(', '));
    if (s.type === 'daily') return ds.length === 7 ? 'naponta' : dayTxt;
    if (s.type === 'weekdays') return dayTxt || 'naponta';
    if (s.type === 'every') {
      var w = { 2: 'kétnaponta', 3: 'háromnaponta', 4: 'négynaponta', 5: 'ötnaponta' }[s.n] || (s.n + ' naponta');
      return w + (ds.length === 7 ? '' : ' (' + dayTxt + ')');
    }
    if (s.type === 'quota') return 'heti ' + (s.quota || 1) + ' alkalom';
    return 'eseti';
  };

  function overlap(a, b) { return a.start != null && b.start != null && a.start < b.end && b.start < a.end; }

  Sch.findSlot = function (state, items, dur, catId, from) {
    var st = state.settings;
    var ws = U.toMin(st.workStart), we = U.toMin(st.workEnd), cut = U.toMin(st.screenCut);
    var lo = LEISURE[catId] ? we : ws, hi = LEISURE[catId] ? cut : we;
    if (from != null) { lo = Math.max(lo, from); if (lo + dur > hi) hi = cut; }
    function scan(a, b) {
      for (var t = Math.ceil(a / 15) * 15; t + dur <= b; t += 15) {
        var probe = { start: t, end: t + dur };
        if (!items.some(function (i) { return i.kind !== 'close' && overlap(i, probe); })) return t;
      }
      return null;
    }
    var r = scan(lo, hi);
    if (r == null && from != null && hi < cut) r = scan(lo, cut);
    return r;
  };

  Sch.markConflicts = function (items) {
    items.forEach(function (i) { delete i.conflict; delete i.conflictWith; });
    var hard = items.filter(function (i) { return (i.kind === 'event' || i.kind === 'travel') && !i.allDay && i.start != null; });
    var acts = items.filter(function (i) { return i.kind === 'activity' && i.start != null; }).sort(function (a, b) { return a.start - b.start; });
    acts.forEach(function (it, idx) {
      var hit = hard.find(function (h) { return overlap(h, it); });
      if (!hit) hit = acts.slice(0, idx).find(function (o) { return !o.conflict && overlap(o, it); });
      if (hit) { it.conflict = true; it.conflictWith = hit.kind === 'travel' ? 'odaút' : hit.title; }
    });
  };

  Sch.sortItems = function (items) {
    items.sort(function (a, b) {
      if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
      if (a.start == null) return 1;
      if (b.start == null) return -1;
      return a.start - b.start || (a.kind === 'template' ? -1 : 1);
    });
    return items;
  };

  function eventItems(state, e) {
    var p = Sch.proj(state, e.projectId);
    var catId = e.catId || (p && p.catId) || null;
    var s = e.allDay ? null : U.toMin(e.start), en = e.allDay ? null : (U.toMin(e.end) || (s + 60));
    var out = [{ id: 'e:' + e.id, kind: 'event', refId: e.id, title: e.title, catId: catId, projectId: e.projectId || null, start: s, end: en, allDay: !!e.allDay, done: false, dur: s == null ? 0 : en - s }];
    if (!e.allDay && e.travel > 0) out.push({ id: 'r:' + e.id, kind: 'travel', refId: e.id, title: 'Odaút: ' + e.title, catId: catId, start: s - e.travel, end: s, dur: e.travel });
    return out;
  }

  Sch.activityItem = function (state, a, items, time) {
    var p = Sch.proj(state, a.projectId), catId = p ? p.catId : null;
    var it = { id: 'a:' + a.id, kind: 'activity', refId: a.id, title: a.title, projectId: a.projectId, catId: catId, dur: a.dur, important: !!a.important, habit: !!a.habit, done: false };
    if (time) { it.start = U.toMin(time); it.end = it.start + a.dur; }
    else {
      var s = Sch.findSlot(state, items, a.dur, catId);
      it.start = s; it.end = s == null ? null : s + a.dur; it.auto = true;
    }
    return it;
  };

  Sch.projectDay = function (state, date) {
    var st = state.settings, items = [];
    var wake = U.toMin(st.wake), ws = U.toMin(st.workStart), lunch = U.toMin(st.lunch), cut = U.toMin(st.screenCut);
    items.push({ id: 't:wake', kind: 'template', title: 'Ébredés, reggeli rutin', start: wake, end: ws });
    if (lunch != null) items.push({ id: 't:lunch', kind: 'template', title: 'Ebéd', start: lunch, end: lunch + (st.lunchLen || 45) });
    items.push({ id: 't:close', kind: 'close', title: 'Esti zárás', start: cut, end: cut + 15 });
    state.events.filter(function (e) { return e.date === date; }).forEach(function (e) { items.push.apply(items, eventItems(state, e)); });
    var due = [];
    state.activities.forEach(function (a) {
      var ov = state.overrides[a.id + '|' + date] || {};
      if (ov.skip) return;
      if (!(Sch.isDue(state, a, date) || ov.extra)) return;
      due.push({ a: a, time: ov.time || a.time, unplaced: !!ov.unplaced });
    });
    due.sort(function (x, y) {
      if (!!x.time !== !!y.time) return x.time ? -1 : 1;
      return (U.toMin(x.time) || 0) - (U.toMin(y.time) || 0) || (y.a.important ? 1 : 0) - (x.a.important ? 1 : 0);
    });
    due.forEach(function (o) {
      var it = Sch.activityItem(state, o.a, items, o.unplaced ? null : o.time);
      if (o.unplaced) { it.start = null; it.end = null; }
      items.push(it);
    });
    Sch.markConflicts(items);
    return Sch.sortItems(items);
  };

  /* Rögzített nap: a reggeli állapot. Az eseményeket mindig szinkronban tartja. */
  Sch.getDay = function (state, date) {
    var day = state.days[date];
    if (!day) return { fixed: false, items: Sch.projectDay(state, date), top3: [] };
    var evs = state.events.filter(function (e) { return e.date === date; });
    var ids = {};
    evs.forEach(function (e) { ids['e:' + e.id] = e; ids['r:' + e.id] = e; });
    day.items = day.items.filter(function (i) { return (i.kind !== 'event' && i.kind !== 'travel') || ids[i.id]; });
    evs.forEach(function (e) {
      eventItems(state, e).forEach(function (fresh) {
        var old = day.items.find(function (i) { return i.id === fresh.id; });
        if (!old) day.items.push(fresh);
        else { fresh.done = old.done; Object.assign(old, fresh); }
      });
    });
    Sch.markConflicts(day.items);
    Sch.sortItems(day.items);
    return { fixed: true, items: day.items, top3: day.top3 || [], day: day };
  };

  Sch.fixDay = function (state, date) {
    if (state.days[date]) return false;
    var items = Sch.projectDay(state, date);
    var top3 = items.filter(function (i) { return i.important && i.start != null; }).slice(0, 3).map(function (i) { return i.id; });
    state.days[date] = { fixedAt: Date.now(), items: items, top3: top3, closed: false, screenOk: null };
    return true;
  };

  /* Ütközés feloldása: rögzített napon a napot írja, előre vetített napon szabálykivételt tesz. */
  Sch.resolve = function (state, date, itemId, how) {
    var info = Sch.getDay(state, date);
    var it = info.items.find(function (i) { return i.id === itemId; });
    if (!it || it.kind !== 'activity') return;
    var a = Sch.act(state, it.refId);
    var key = it.refId + '|' + date;
    if (how === 'later') {
      var others = info.items.filter(function (i) { return i !== it; });
      var after = it.start;
      others.forEach(function (o) { if (overlap(o, it) && o.kind !== 'close') after = Math.max(after, o.end); });
      var slot = Sch.findSlot(state, others, it.dur, it.catId, after);
      if (info.fixed) { it.start = slot; it.end = slot == null ? null : slot + it.dur; }
      else state.overrides[key] = slot == null ? { unplaced: true } : { time: U.toInputTime(slot) };
    } else if (how === 'skip' || how === 'tomorrow') {
      if (info.fixed) {
        info.day.items = info.day.items.filter(function (i) { return i !== it; });
        info.day.top3 = (info.day.top3 || []).filter(function (id) { return id !== itemId; });
      } else state.overrides[key] = { skip: true };
      if (how === 'tomorrow' && a) {
        var tm = U.addDays(date, 1);
        if (a.sched.type === 'every') a.sched.anchor = tm;
        else if (a.sched.type !== 'quota') state.overrides[a.id + '|' + tm] = { extra: true };
        var tday = state.days[tm];
        if (tday && !tday.items.some(function (i) { return i.refId === a.id; })) tday.items.push(Sch.activityItem(state, a, tday.items, a.time));
      }
    }
  };

  /* Egy új tevékenység hozzáadása egy már rögzített naphoz („Mára is"). */
  Sch.addToDay = function (state, date, a) {
    var day = state.days[date];
    if (!day || day.items.some(function (i) { return i.refId === a.id; })) return null;
    var it = Sch.activityItem(state, a, day.items, a.time);
    if (date === U.today() && it.start != null && it.start < U.nowMin()) {
      var s = Sch.findSlot(state, day.items, a.dur, it.catId, U.nowMin());
      it.start = s; it.end = s == null ? null : s + a.dur;
    }
    day.items.push(it);
    Sch.markConflicts(day.items); Sch.sortItems(day.items);
    return it;
  };

  Sch.tasksFor = function (state, date) { return state.tasks.filter(function (t) { return t.date === date; }); };
  Sch.overdue = function (state) { var t = U.today(); return state.tasks.filter(function (x) { return !x.done && x.date && x.date < t; }); };
  Sch.releases = function (state, date) { return state.treasures.filter(function (t) { return t.date === date && !t.got; }); };

  Sch.dayDots = function (state, date) {
    var info = Sch.getDay(state, date), seen = {}, out = [];
    info.items.forEach(function (i) {
      if (i.kind === 'template' || i.kind === 'close' || i.kind === 'travel' || !i.catId || seen[i.catId]) return;
      seen[i.catId] = 1; out.push(i.catId);
    });
    Sch.tasksFor(state, date).forEach(function (t) {
      var c = t.catId || (Sch.proj(state, t.projectId) || {}).catId;
      if (c && !seen[c]) { seen[c] = 1; out.push(c); }
    });
    return out.slice(0, 4);
  };

  /* Sorozat: egymás utáni esedékes alkalmak, amikor megvolt. */
  Sch.streak = function (state, a) {
    var today = U.today(), start = a.startDate || today;
    Object.keys(state.days).forEach(function (d) { if (d < start) start = d; });
    var cur = 0, best = 0, guard = 0, unit = (a.sched.type === 'every' || a.sched.type === 'quota') ? 'alkalom' : 'nap';
    for (var d = start; d <= today && guard < 3000; d = U.addDays(d, 1), guard++) {
      var day = state.days[d];
      var due = day ? day.items.some(function (i) { return i.refId === a.id; }) : (d === today ? false : Sch.isDue(state, a, d));
      if (!due) continue;
      if (doneOn(state, a.id, d)) { cur++; if (cur > best) best = cur; }
      else if (d !== today) cur = 0;
    }
    return { cur: cur, best: best, unit: unit };
  };

  Sch.habitGrid = function (state, a, n) {
    var today = U.today(), out = [];
    for (var i = n - 1; i >= 0; i--) {
      var d = U.addDays(today, -i), day = state.days[d];
      var due = day ? day.items.some(function (x) { return x.refId === a.id; }) : (d < (a.startDate || today) ? false : Sch.isDue(state, a, d));
      out.push({ date: d, state: doneOn(state, a.id, d) ? 'done' : (!due ? 'off' : (d === today ? 'today' : 'miss')) });
    }
    return out;
  };

  /* Tervezett és elvégzett percek kategóriánként, a használt (rögzített) napokon. */
  Sch.balance = function (state, from, to) {
    var res = {}, now = U.nowMin(), today = U.today();
    for (var d = from; d <= to; d = U.addDays(d, 1)) {
      var day = state.days[d];
      if (!day) continue;
      day.items.forEach(function (i) {
        if ((i.kind !== 'activity' && i.kind !== 'event') || !i.catId || i.allDay) return;
        var dur = i.dur || (i.end - i.start) || 0;
        var r = res[i.catId] = res[i.catId] || { planned: 0, done: 0 };
        r.planned += dur;
        var done = i.kind === 'event' ? (d < today || (d === today && i.end <= now)) : i.done;
        if (done) r.done += dur;
      });
    }
    return res;
  };

  Sch.metricSum = function (state, mid, from, to) {
    var s = 0, n = 0;
    Object.keys(state.metricLogs).forEach(function (d) {
      if (d < from || d > to) return;
      var v = state.metricLogs[d][mid];
      if (v != null) { s += v; n++; }
    });
    return { sum: s, n: n };
  };
  Sch.metricTotal = function (state, mid) { return Sch.metricSum(state, mid, '0000-00-00', '9999-12-31').sum; };
  Sch.weightSeries = function (state) {
    return Object.keys(state.metricLogs).sort().filter(function (d) { return state.metricLogs[d].m_weight != null; })
      .map(function (d) { return { date: d, v: state.metricLogs[d].m_weight }; });
  };
  Sch.nextWeigh = function (state, from) {
    var wd = state.settings.weighDay, d = from || U.today();
    for (var i = 0; i < 7; i++) { if (U.dow(d) === wd) return d; d = U.addDays(d, 1); }
    return d;
  };
})();
