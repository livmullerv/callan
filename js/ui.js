/* Nézetek: minden képernyő és lap HTML-ként. Az állapotot nem módosítják. */
(function () {
  var CA = window.CA = window.CA || {};
  var U = CA.util, Sch = CA.sched, C = CA.callan;
  var esc = U.esc;
  var V = CA.views = {};

  /* ---------- Ikonok (duotone, currentColor) ---------- */
  function svg(size, inner, extra) { return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"' + (extra || '') + '>' + inner + '</svg>'; }
  var S = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var F = 'fill="currentColor" opacity="0.22"';
  var CAT_ICONS = {
    home: '<rect x="3" y="4.5" width="18" height="11" rx="2.5" ' + F + '></rect><rect x="3" y="4.5" width="18" height="11" rx="2.5" ' + S + '></rect><path d="M9 20h6M12 15.5V20" ' + S + '></path>',
    fires: '<path d="M12 2.8c3 3.3 5.6 5.7 5.6 9.2a5.6 5.6 0 0 1-11.2 0c0-2.3 1.2-3.9 2.7-5.5 1.4-1.4 2.5-2.6 2.9-3.7Z" ' + F + '></path><path d="M12 20.2a3.1 3.1 0 0 1-3.1-3.1c0-1.7 1.4-2.7 3.1-4.8 1.7 2.1 3.1 3.1 3.1 4.8a3.1 3.1 0 0 1-3.1 3.1Z" ' + S + '></path>',
    write: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" ' + F + '></path><path d="M19 18v3H6.5A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3H19ZM8.5 3v15" ' + S + '></path>',
    grow: '<path d="M20.5 3.5c0 8.3-4.7 12.5-10.4 12.5-1.6 0-3.1-.4-4.1-1 0-7.3 5.2-11.5 14.5-11.5Z" fill="currentColor" opacity="0.24"></path><path d="M5 20.5c1.1-5.4 4.8-9.6 9.6-11.6" ' + S + '></path>',
    hobby: '<path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" ' + F + '></path><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5ZM9 3.5v2M12.5 3.5v2" ' + S + '></path>',
    family: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" ' + F + '></path><path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" ' + S + '></path>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" ' + F + '></path><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 10h18" ' + S + '></path>',
    dot: '<circle cx="12" cy="12" r="7" ' + F + '></circle><circle cx="12" cy="12" r="7" ' + S + '></circle>'
  };
  var I = {
    check: svg(16, '<path d="M5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"></path>'),
    plus: svg(18, '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path>'),
    close: svg(20, '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>'),
    left: svg(20, '<path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>'),
    right: svg(20, '<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>'),
    down: svg(18, '<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>'),
    up: svg(18, '<path d="m6 15 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>'),
    gear: svg(22, '<circle cx="12" cy="12" r="8.5" fill="currentColor" opacity="0.16"></circle><circle cx="12" cy="12" r="2.6" ' + S + '></circle><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" ' + S + '></path>'),
    star: svg(20, '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z" fill="currentColor"></path>'),
    mic: svg(20, '<rect x="8.5" y="2.8" width="7" height="12" rx="3.5" fill="currentColor" opacity="0.25"></rect><rect x="8.5" y="2.8" width="7" height="12" rx="3.5" ' + S + '></rect><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" ' + S + '></path>'),
    gem: function (s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9Z" fill="#A07845" opacity="0.35"></path><path d="M6 3h12l4 6-10 12L2 9ZM2 9h20" fill="none" stroke="#8A6536" stroke-width="2.2" stroke-linejoin="round"></path></svg>'; },
    drop: function (sz, filled) {
      var d = 'M12 3.2c3.4 4.4 6 7.7 6 10.9a6 6 0 0 1-12 0c0-3.2 2.6-6.5 6-10.9Z';
      return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 0 24 24" aria-hidden="true">' + (filled
        ? '<path d="' + d + '" fill="#A76D5E"></path>'
        : '<path d="' + d + '" fill="#A76D5E" opacity="0.18"></path><path d="' + d + '" fill="none" stroke="#A76D5E" stroke-width="2.4" stroke-linejoin="round"></path>') + '</svg>';
    },
    moon: svg(18, '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" fill="currentColor" opacity="0.25"></path><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" ' + S + '></path>'),
    bulb: svg(18, '<path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3Z" ' + F + '></path><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3ZM9.5 19.5h5M10.5 22h3" ' + S + '></path>'),
    chest: svg(18, '<path d="M3.5 11h17v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" ' + F + '></path><path d="M3.5 11V8.5A5.5 5.5 0 0 1 9 3h6a5.5 5.5 0 0 1 5.5 5.5V11M3.5 11h17v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2ZM10.5 11v3h3v-3" ' + S + '></path>'),
    nav: {
      ma: svg(24, '<circle cx="12" cy="12" r="5.2" ' + F + '></circle><circle cx="12" cy="12" r="5.2" ' + S + ' stroke-width="1.8"></circle><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" ' + S + ' stroke-width="1.8"></path>'),
      cal: svg(24, '<rect x="3.2" y="5" width="17.6" height="16" rx="3.4" ' + F + '></rect><rect x="3.2" y="5" width="17.6" height="16" rx="3.4" ' + S + ' stroke-width="1.8"></rect><path d="M3.2 10h17.6M8 3v3.6M16 3v3.6" ' + S + ' stroke-width="1.8"></path>'),
      proj: svg(24, '<path d="M12 2.6 21.4 7.6 12 12.6 2.6 7.6Z" ' + F + '></path><path d="M12 2.6 21.4 7.6 12 12.6 2.6 7.6ZM2.6 12.4 12 17.4l9.4-5M2.6 16.8 12 21.8l9.4-5" ' + S + ' stroke-width="1.8"></path>'),
      notes: svg(24, '<path d="M6 3h8.5L19 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" ' + F + '></path><path d="M6 3h8.5L19 7.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14.5 3v4.5H19M8 12h7M8 16h5" ' + S + ' stroke-width="1.8"></path>'),
      res: svg(24, '<path d="M5 13h3v6H5zM10.5 8.5h3V19h-3zM16 11h3v8h-3z" fill="currentColor" opacity="0.24"></path><path d="M3.5 20.5h17M5 13h3v6H5zM10.5 8.5h3V19h-3zM16 11h3v8h-3z" ' + S + ' stroke-width="1.8"></path>')
    }
  };
  V.I = I;

  function catIconSvg(state, catId, size, folder) {
    var c = Sch.cat(state, catId);
    var key = folder ? 'folder' : (c && CAT_ICONS[c.icon] ? c.icon : 'dot');
    return svg(size || 24, CAT_ICONS[key]);
  }
  function chipIco(state, catId, folder, size) {
    var col = Sch.catColor(state, catId);
    return '<div class="chip-ico" style="background:' + U.hexA(col, .14) + ';color:' + col + (size ? ';width:' + size + 'px;height:' + size + 'px;border-radius:' + Math.round(size / 3) + 'px' : '') + '">' + catIconSvg(state, catId, size ? Math.round(size * .52) : 24, folder) + '</div>';
  }
  function say(mood, text, actions) {
    return '<div class="sec" style="gap:10px"><div class="say"><div class="say-av">' + C.svg(mood, 64, true) + '</div><div class="say-bubble">' + text + '</div></div>' +
      (actions ? '<div class="say-actions">' + actions + '</div>' : '') + '</div>';
  }
  V.say = say;
  function check(on, color, attrs, label, sm) {
    return '<button type="button" class="check' + (on ? ' on' : '') + (sm ? ' sm' : '') + '" ' + attrs + ' aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) + '" style="' + (on ? 'background:' + color : '') + '">' + (on ? I.check : '') + '</button>';
  }
  function sw(on, attrs, label) { return '<button type="button" class="switch" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" aria-label="' + esc(label) + '" ' + attrs + '></button>'; }
  function seg(opts, active, attrsFn) {
    return '<div class="seg" style="grid-template-columns:repeat(' + opts.length + ',minmax(0,1fr))">' + opts.map(function (o) {
      return '<button type="button" class="' + (o[0] === active ? 'on' : '') + '" aria-pressed="' + (o[0] === active) + '" ' + attrsFn(o[0]) + '>' + o[1] + '</button>';
    }).join('') + '</div>';
  }
  function catChips(state, sel, attrsFn, withNew) {
    return '<div class="chips">' + state.categories.map(function (c) {
      var on = c.id === sel;
      return '<button type="button" class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" style="' + (on ? 'background:' + c.color : '') + '" ' + attrsFn(c.id) + '>' + (on ? '' : '<span class="dot" style="background:' + c.color + '"></span>') + esc(c.name) + '</button>';
    }).join('') + (withNew ? '<button type="button" class="chip ghost" data-a="open" data-s="newcat">' + I.plus + 'Új kategória</button>' : '') + '</div>';
  }
  function projOptions(state, sel, filterFn) {
    var o = '<option value="">Nincs projekt</option>';
    state.categories.forEach(function (c) {
      var ps = state.projects.filter(function (p) { return p.catId === c.id && !p.archived && (!filterFn || filterFn(p)); });
      if (!ps.length) return;
      o += '<optgroup label="' + esc(c.name) + '">' + ps.map(function (p) { return '<option value="' + p.id + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</optgroup>';
    });
    return o;
  }
  function daysLeft(d) { return U.diffDays(U.today(), d); }
  var HOURS = ['Éjfél', 'Egy óra', 'Két óra', 'Három óra', 'Négy óra', 'Öt óra', 'Hat óra', 'Hét óra', 'Nyolc óra', 'Kilenc óra', 'Tíz óra', 'Tizenegy óra', 'Dél', 'Egy óra', 'Két óra', 'Három óra', 'Négy óra', 'Öt óra', 'Hat óra', 'Hét óra', 'Nyolc óra', 'Kilenc óra', 'Tíz óra', 'Tizenegy óra'];
  function lower1(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function itemSub(state, it) {
    var c = Sch.cat(state, it.catId);
    var t = it.start != null ? U.toHM(it.start) + '–' + U.toHM(it.end) : (it.allDay ? 'egész nap' : 'nincs időpontja');
    var p = it.projectId ? Sch.proj(state, it.projectId) : null;
    return t + ' · ' + esc(p && p.name !== it.title ? p.name : (c ? c.name : ''));
  }

  /* ---------- Alsó sáv ---------- */
  V.nav = function (ui) {
    var tabs = [['ma', 'Ma'], ['cal', 'Naptár'], ['proj', 'Projektek'], ['notes', 'Jegyzetek'], ['res', 'Eredmények']];
    return '<nav class="nav" aria-label="Fő navigáció"><div class="nav-in">' + tabs.map(function (t) {
      var on = ui.tab === t[0];
      return '<button type="button" class="' + (on ? 'on' : '') + '" data-a="tab" data-t="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + I.nav[t[0]] + '<span>' + t[1] + '</span></button>';
    }).join('') + '</div></nav>';
  };
  V.toast = function (ui) {
    if (!ui.toast) return '';
    var t = ui.toast;
    return '<div class="toast" role="status"><span>' + esc(t.text) + '</span>' + (t.a ? '<button type="button" data-a="' + t.a + '" data-id="' + esc(t.id || '') + '">' + esc(t.label) + '</button>' : '') + '</div>';
  };
  V.screen = function (state, ui) {
    return { ma: V.ma, cal: V.cal, proj: V.proj, notes: V.notes, res: V.res }[ui.tab](state, ui);
  };

  /* ---------- MA ---------- */
  function maMessage(state, info, now) {
    var st = state.settings, h = Math.floor(now / 60);
    var ws = U.toMin(st.workStart), we = U.toMin(st.workEnd), cut = U.toMin(st.screenCut);
    var top = (info.top3 || []).map(function (id) { return info.items.find(function (i) { return i.id === id; }); }).filter(Boolean);
    var open = top.filter(function (i) { return !i.done; });
    var today = U.today();
    if (info.day && info.day.closed) return { mood: 'almos', text: 'Mára lezártuk a napot. Holnap is itt leszek.' };
    if (now >= cut) return { mood: 'almos', text: U.toHM(cut) + ' elmúlt. Mára elég volt. Zárjuk le a napot?', act: '<button type="button" class="btn-white" data-a="open" data-s="close">Esti zárás</button>' };
    if (U.dow(today) === st.weighDay && !(state.metricLogs[today] && state.metricLogs[today].m_weight != null) && now < 12 * 60)
      return { mood: 'nyugodt', text: 'Vasárnap van. Mérlegelés még reggeli előtt?' };
    if (top.length && !open.length) return { mood: 'buszke', text: (top.length === 3 ? 'Mind a három' : 'Minden') + ' fő dolog kész. Szép nap.' };
    if (now < ws) return { mood: 'beszel', text: 'Jó reggelt. ' + U.toHM(ws) + '-kor indul a nap' + (open[0] ? ', elsőként: ' + esc(lower1(open[0].title)) + '.' : '.') };
    if (now < 12 * 60) return { mood: 'beszel', text: HOURS[h] + '. Most van a legjobb fejed' + (open[0] ? ' — ' + esc(lower1(open[0].title)) + ' jöhet.' : '.') };
    if (now < we) return { mood: 'beszel', text: open.length ? (open.length === 1 ? 'Egy fő dolog van még hátra: ' + esc(lower1(open[0].title)) + '.' : open.length + ' fő dolog van még hátra. A következő: ' + esc(lower1(open[0].title)) + '.') : 'Délután van. Haladj a saját tempódban.' };
    return { mood: 'nyugodt', text: 'Munkaidő vége. Innentől csak a saját dolgaid.' };
  }

  function blockStyle(state, it) {
    var col = Sch.catColor(state, it.catId);
    return 'background:' + U.hexA(col, .12) + ';border-left-color:' + col;
  }
  function kindLabel(state, it) {
    if (it.kind === 'event') return 'esemény';
    if (it.kind === 'travel') return 'odaút';
    if (it.kind === 'task') {
      var t = Sch.task(state, it.refId);
      if (!t) return 'feladat';
      return t.mode === 'due' ? 'határidő ' + U.fmtShort(t.due) + ' · ' + hoursTxt(t) : 'feladat';
    }
    var a = Sch.act(state, it.refId);
    if (!a) return '';
    if (a.sched.type === 'quota') return 'heti kvóta';
    if (a.habit) return 'szokás';
    return Sch.describe(a);
  }

  function hrs(m) { return U.num(m / 60, 1) + ' óra'; }
  function hoursTxt(t) { return U.num((t.spent || 0) / 60, 1) + ' / ' + hrs(t.est || 0); }
  V.hoursTxt = hoursTxt;

  function timelineRows(state, date, info, isToday) {
    var st = state.settings, we = U.toMin(st.workEnd), now = U.nowMin();
    var html = '', dividerDone = false, nowDone = !isToday;
    var rows = info.items.filter(function (i) { return !i.allDay && i.start != null; });
    rows.forEach(function (it) {
      if (!nowDone && it.start > now) {
        nowDone = true;
        if (now >= U.toMin(st.wake) - 60) html += '<div class="now"><div class="tl-time">' + U.toHM(now) + '</div><div class="now-line"><span class="now-dot"></span><span class="now-bar"></span></div></div>';
      }
      if (!dividerDone && it.start >= we) {
        dividerDone = true;
        html += '<div class="divider"><i></i><span>' + U.toHM(we) + ' után nincs munka</span><i></i></div>';
      }
      var after = it.start >= we ? ' tl-after' : '';
      if (it.kind === 'template' || it.kind === 'travel') {
        html += '<div class="tl-row"><div class="tl-time t-s">' + U.toHM(it.start) + '</div><div class="tl-block tpl"' + (it.kind === 'travel' ? ' style="background:' + U.hexA(Sch.catColor(state, it.catId), .08) + '"' : '') + '>' + esc(it.title) + '</div></div>';
        return;
      }
      if (it.kind === 'close') {
        html += '<div class="tl-row"><div class="tl-time t-s">' + U.toHM(it.start) + '</div><button type="button" class="tl-block close" data-a="open" data-s="close">' + I.moon + '<span>Esti zárás — egy perc, és kész a nap</span></button></div>';
        return;
      }
      html += itemRow(state, date, info, it, after);
    });
    if (!nowDone && isToday && now <= U.toMin(st.screenCut) + 60) html += '<div class="now"><div class="tl-time">' + U.toHM(now) + '</div><div class="now-line"><span class="now-dot"></span><span class="now-bar"></span></div></div>';
    return html;
  }
  function itemRow(state, date, info, it, extraCls) {
    var col = Sch.catColor(state, it.catId);
    var inTop = (info.top3 || []).indexOf(it.id) >= 0;
    var fixed = info.fixed;
    var h = '<div class="tl-row' + (extraCls || '') + '"><div class="tl-time">' + (it.start != null ? U.toHM(it.start) : '') + '</div>' +
      '<div class="tl-block' + (it.done ? ' done' : '') + '" style="' + blockStyle(state, it) + '">' +
      '<button type="button" class="tl-main" style="border:0;background:none;padding:0;text-align:left" data-a="open" data-s="item" data-date="' + date + '" data-id="' + it.id + '">' +
      '<span class="tl-title">' + esc(it.title) + '</span><span class="tl-sub" style="color:' + col + '">' + (it.start != null ? U.toHM(it.start) + '–' + U.toHM(it.end) + ' · ' : '') + esc(kindLabel(state, it)) + (it.conflict ? ' · <span class="badge-warn">ütközik</span>' : '') + '</span></button>' +
      (fixed && (it.kind === 'activity' || it.kind === 'task') ? '<button type="button" class="tl-star' + (inTop ? ' on' : '') + '" data-a="star" data-date="' + date + '" data-id="' + it.id + '" aria-pressed="' + inTop + '" aria-label="Fő dolog: ' + esc(it.title) + '">' + I.star + '</button>' : '') +
      (fixed ? check(it.done, col, 'data-a="done" data-date="' + date + '" data-id="' + it.id + '"', 'Kész: ' + it.title, true) : '') +
      '</div></div>';
    if (it.conflict) h += conflictCard(state, date, it);
    return h;
  }
  function conflictCard(state, date, it) {
    var a = it.kind === 'activity' ? Sch.act(state, it.refId) : null, tk = it.kind === 'task' ? Sch.task(state, it.refId) : null;
    var canMove = !!tk || (a && a.sched.type !== 'daily' && a.sched.type !== 'weekdays');
    var moveTxt = tk && tk.mode === 'due' ? 'Másik napra' : 'Másnapra';
    return '<div class="conflict-card"><p>' + esc(it.title) + ' ütközik ezzel: ' + esc(it.conflictWith || 'egy másik tétel') + '.</p><div class="chips">' +
      '<button type="button" class="btn-white" data-a="resolve" data-date="' + date + '" data-id="' + it.id + '" data-how="later">Később aznap</button>' +
      (canMove ? '<button type="button" class="btn-white" data-a="resolve" data-date="' + date + '" data-id="' + it.id + '" data-how="tomorrow">' + moveTxt + '</button>' : '') +
      (tk ? '' : '<button type="button" class="btn-white" style="color:#8A4B3A" data-a="resolve" data-date="' + date + '" data-id="' + it.id + '" data-how="skip">Kimarad</button>') + '</div></div>';
  }

  function metricRows(state, date, list) {
    var logs = state.metricLogs[date] || {};
    return list.map(function (m) {
      var v = logs[m.id];
      var p = Sch.proj(state, m.projectId), col = p ? Sch.catColor(state, p.catId) : '#6F7A5A';
      var label = esc(m.name) + (m.target ? ' — cél ' + U.num(m.target) + ' ' + esc(m.unit) : (m.unit ? ' (' + esc(m.unit) + ')' : ''));
      var pct = m.target && v != null ? Math.min(100, Math.round(v / m.target * 100)) : null;
      return '<div class="num-row"><div class="grow" style="display:flex;flex-direction:column;gap:8px"><label for="m-' + m.id + '-' + date + '">' + label + '</label>' +
        (pct != null || m.target ? '<div class="bar"><i style="width:' + (pct || 0) + '%;background:' + col + '"></i></div>' : '') + '</div>' +
        '<input id="m-' + m.id + '-' + date + '" class="num-input" inputmode="decimal" autocomplete="off" value="' + (v == null ? '' : String(v).replace('.', ',')) + '" placeholder="–" data-change="metric" data-id="' + m.id + '" data-date="' + date + '"></div>';
    }).join('');
  }
  V.metricRows = metricRows;
  function todaysMetrics(state, date, items) {
    var isWeigh = U.dow(date) === state.settings.weighDay;
    return state.metrics.filter(function (m) {
      if (m.mode === 'weekly') return isWeigh;
      if (m.activityId) return items.some(function (i) { return i.refId === m.activityId; }) || (state.metricLogs[date] && state.metricLogs[date][m.id] != null);
      return true;
    });
  }
  V.todaysMetrics = todaysMetrics;

  V.ma = function (state, ui) {
    var t = U.today(), info = Sch.getDay(state, t), now = U.nowMin(), st = state.settings;
    var h = '<main class="screen">';
    h += '<div class="head"><div><div class="head-kicker">' + U.DAYS[U.dow(t)] + '</div><h1 class="h1">' + U.cap(U.fmtDate(t)) + '</h1></div>' +
      '<button type="button" class="icon-btn" data-a="open" data-s="settings" aria-label="Beállítások">' + I.gear + '</button></div>';

    if (ui.update) h += say('nyugodt', 'Új verzióm érkezett. Frissítsek?', '<button type="button" class="btn-white" data-a="update">Frissítés</button>');
    var msg = maMessage(state, info, now);
    h += say(msg.mood, msg.text, msg.act);

    // Biztonsági mentés
    var lb = st.lastBackup, created = (state.createdAt || '').slice(0, 10);
    var sunday = U.dow(t) === 6;
    if ((sunday && lb !== t) || (!sunday && ((lb && U.diffDays(lb, t) > 8) || (!lb && created && U.diffDays(created, t) >= 7)))) {
      h += say('nyugodt', sunday ? 'Mentsük el a heti biztonsági másolatot?' : 'Régen mentettünk. Készítsünk biztonsági másolatot?', '<button type="button" class="btn-white" data-a="backup">Mentés Drive-ra</button>');
    }

    // Elmaradt feladatok
    var od = Sch.overdue(state);
    if (od.length) {
      h += '<div class="sec"><div class="label">Korábbról maradt</div><div class="card pad-s list">' + od.map(function (x) {
        return '<div style="padding:14px 0;display:flex;flex-direction:column;gap:10px"><div class="between"><div class="grow" style="font-size:15px;font-weight:600">' + esc(x.title) + '</div><div class="tiny muted">' + (x.mode === 'due' ? 'határidő: ' + U.relDay(x.due) : U.relDay(x.date)) + '</div></div>' +
          (x.mode === 'due' && x.est ? '<p class="help">Még ' + hrs(Sch.taskRemaining(x)) + ' van hátra belőle. A „Mára” a mai napba tesz egy blokkot, a „Holnapra” holnapra tolja a határidőt.</p>' : '') +
          (x.pushes >= 2 ? '<p class="help">Ezt már ' + (x.pushes + 1) + '. alkalommal tolnád. Tényleg kell még?</p>' : '') +
          '<div class="chips"><button type="button" class="btn-white" style="background:var(--field)" data-a="taskMove" data-id="' + x.id + '" data-to="today">Mára</button><button type="button" class="btn-white" style="background:var(--field)" data-a="taskMove" data-id="' + x.id + '" data-to="tomorrow">Holnapra</button><button type="button" class="btn-white" style="background:var(--field)" data-a="task" data-id="' + x.id + '">Kész</button><button type="button" class="btn-white" style="background:var(--field);color:#8A4B3A" data-a="taskMove" data-id="' + x.id + '" data-to="del">Törlés</button></div></div>';
      }).join('') + '</div></div>';
    }

    // Megjelenések
    Sch.releases(state, t).forEach(function (r) {
      h += '<button type="button" class="release" style="border:0;text-align:left" data-a="open" data-s="treasure" data-id="' + r.id + '"><div style="width:38px;height:38px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center">' + I.gem(20) + '</div><div><div class="tiny" style="color:#7A5B33">Ma jelenik meg a Kincsesládából</div><div style="font-size:15px;font-weight:600">' + esc(r.title) + '</div></div></button>';
    });

    // Mai három
    var top = (info.top3 || []).map(function (id) { return info.items.find(function (i) { return i.id === id; }); }).filter(Boolean);
    h += '<div class="sec"><div class="label">A mai három dolog</div>';
    if (!top.length) h += '<div class="card"><p class="help">Nincs kijelölt fő dolog. Az idővonalon a csillaggal választhatsz legfeljebb hármat.</p></div>';
    top.forEach(function (it) {
      var col = Sch.catColor(state, it.catId);
      h += '<div class="t3' + (it.done ? ' done' : '') + '">' + chipIco(state, it.catId) + '<div class="grow"><div class="t3-title">' + esc(it.title) + '</div><div class="t3-sub">' + itemSub(state, it) + '</div></div>' +
        check(it.done, col, 'data-a="done" data-date="' + t + '" data-id="' + it.id + '"', 'Kész: ' + it.title) + '</div>';
    });
    h += '</div>';

    // Idővonal
    h += '<div class="sec"><div class="between"><div class="label">A napod</div><button type="button" class="btn-link" data-a="open" data-s="entry" data-mode="task" data-date="' + t + '">+ Feladat</button></div><div class="tl">';
    info.items.filter(function (i) { return i.allDay; }).forEach(function (it) { h += itemRow(state, t, info, it); });
    h += timelineRows(state, t, info, true);
    var unplaced = info.items.filter(function (i) { return !i.allDay && i.start == null; });
    if (unplaced.length) {
      h += '<div class="divider"><i></i><span>Nem fért be</span><i></i></div>';
      unplaced.forEach(function (it) { h += itemRow(state, t, info, it); });
    }
    h += '</div></div>';

    // Szokások
    var habits = info.items.filter(function (i) { return i.habit && i.kind === 'activity'; });
    if (habits.length) {
      h += '<div class="sec"><div class="label">Szokások</div><div class="card habits">' + habits.map(function (it) {
        var a = Sch.act(state, it.refId), col = Sch.catColor(state, it.catId), s = a ? Sch.streak(state, a) : { cur: 0, unit: 'nap' };
        return '<div class="habit"><button type="button" class="habit-btn' + (it.done ? ' on' : '') + '" style="' + (it.done ? 'background:' + col : '') + '" data-a="done" data-date="' + t + '" data-id="' + it.id + '" aria-pressed="' + !!it.done + '" aria-label="' + esc(it.title) + '">' + (it.done ? I.check : '') + '</button>' +
          '<div class="habit-name">' + esc(it.title.split(' ')[0]) + '</div><div class="habit-streak" style="color:' + (s.cur ? col : 'var(--faint)') + '">' + s.cur + ' ' + s.unit + '</div></div>';
      }).join('') + '</div></div>';
    }

    // Mai számok
    var ms = todaysMetrics(state, t, info.items);
    if (ms.length) h += '<div class="sec"><div class="label">Mai számok</div><div class="card pad-s list">' + metricRows(state, t, ms) + '</div></div>';

    // Visszaszámlálók
    state.projects.filter(function (p) { return p.countdown && p.deadline && p.deadline >= t && !p.archived; }).forEach(function (p) {
      var col = Sch.catColor(state, p.catId);
      var hab = info.items.find(function (i) { return i.projectId === p.id && i.kind === 'activity'; });
      h += '<div class="countdown" style="background:' + U.hexA(col, .12) + '"><div class="grow"><div class="small" style="color:' + col + ';font-weight:600">' + esc(p.countdownLabel || p.name) + ' — ' + U.fmtDate(p.deadline) + '</div>' +
        (hab ? '<div class="tiny muted" style="margin-top:3px">' + (hab.done ? 'A mai ' + esc(lower1(hab.title)) + ' kész' : 'A mai ' + esc(lower1(hab.title)) + ' még hátravan') + '</div>' : '') +
        '</div><div class="row" style="gap:6px;align-items:baseline"><span class="big-num" style="font-size:40px;color:' + col + '">' + daysLeft(p.deadline) + '</span><span class="small" style="color:' + col + '">nap</span></div></div>';
    });

    // Vasárnap: heti tervezés
    if (U.dow(t) === 6) h += '<button type="button" class="card" style="border:0;text-align:left;display:flex;align-items:center;gap:14px" data-a="open" data-s="plan">' + C.svg('beszel', 48, true) + '<div class="grow"><div style="font-weight:600;font-size:15px">Heti tervezés</div><div class="small muted">Osszuk be a jövő hét feladatait</div></div>' + I.right + '</button>';

    return h + '</main>';
  };

  /* ---------- NAPTÁR ---------- */
  function calDots(state, d) {
    var today = U.today();
    if (d < today && !state.days[d]) {
      var out = [], seen = {};
      state.events.filter(function (e) { return e.date === d; }).forEach(function (e) {
        var c = e.catId || (Sch.proj(state, e.projectId) || {}).catId;
        if (c && !seen[c]) { seen[c] = 1; out.push(c); }
      });
      return out;
    }
    return Sch.dayDots(state, d);
  }
  function cycleRow(state, d) {
    var c = state.settings.cycle;
    if (!c || !c.on) return '';
    var ci = Sch.cycleInfo(state, d), isStart = (state.periods || []).indexOf(d) >= 0;
    var txt = ci ? (ci.type === 'actual' ? 'Menstruáció · ' + ci.day + '. nap' : 'Várható menstruáció · ' + ci.day + '. nap') : '';
    var btn = isStart
      ? '<button type="button" class="btn-white" data-a="periodDel" data-d="' + d + '">Kezdet törlése</button>'
      : (d <= U.today() ? '<button type="button" class="btn-white" data-a="periodAdd" data-d="' + d + '">' + (d === U.today() ? 'Ma kezdődött' : 'Ezen a napon kezdődött') + '</button>' : '');
    if (!txt && !btn) return '';
    return '<div class="cycle-row">' + I.drop(20, !ci || ci.type === 'actual') + '<div class="grow small" style="color:#7E4E42">' + (txt || 'Menstruáció kezdete') + '</div>' + btn + '</div>';
  }

  V.cal = function (state, ui) {
    var today = U.today();
    var month = ui.cal.month || today.slice(0, 7), sel = ui.cal.sel || today;
    var first = month + '-01', fd = U.parse(first);
    var start = U.weekStart(first);
    var lastDay = new Date(fd.getFullYear(), fd.getMonth() + 1, 0).getDate();
    var last = month + '-' + String(lastDay).padStart(2, '0');
    var cells = U.diffDays(start, last) + 1, weeks = Math.ceil(cells / 7);
    var h = '<main class="screen">';
    h += '<div class="between"><div class="row" style="gap:2px"><button type="button" class="icon-btn plain" data-a="calMonth" data-d="-1" aria-label="Előző hónap">' + I.left + '</button>' +
      '<h1 class="h1" style="margin:0;font-size:28px">' + U.cap(U.MONTHS[fd.getMonth()]) + (fd.getFullYear() !== new Date().getFullYear() ? ' ' + fd.getFullYear() : '') + '</h1>' +
      '<button type="button" class="icon-btn plain" data-a="calMonth" data-d="1" aria-label="Következő hónap">' + I.right + '</button></div>' +
      '<button type="button" class="btn sm" data-a="open" data-s="entry" data-date="' + sel + '">' + I.plus + 'Új</button></div>';
    h += '<div class="card cal"><div class="cal-grid">' + U.DAYS_SHORT.map(function (d) { return '<div class="cal-wd">' + d + '</div>'; }).join('') + '</div><div class="cal-grid">';
    for (var i = 0; i < weeks * 7; i++) {
      var d = U.addDays(start, i), out = d.slice(0, 7) !== month;
      var dots = out ? [] : calDots(state, d), gem = !out && Sch.releases(state, d).length, cyc = out ? null : Sch.cycleInfo(state, d);
      h += '<button type="button" class="cal-day' + (out ? ' out' : '') + (d === today ? ' today' : '') + (d === sel ? ' sel' : '') + '" data-a="calSel" data-d="' + d + '" aria-label="' + U.fmtLong(d) + '"' + (d === sel ? ' aria-current="date"' : '') + '>' +
        '<span class="cal-num">' + U.parse(d).getDate() + '</span><span class="cal-dots">' + dots.map(function (c) { return '<i style="background:' + Sch.catColor(state, c) + '"></i>'; }).join('') + '</span>' +
        (gem ? '<span class="cal-gem">' + I.gem(11) + '</span>' : '') +
        (cyc ? '<span class="cal-drop">' + I.drop(11, cyc.type === 'actual') + '</span>' : '') + '</button>';
    }
    h += '</div></div>';
    h += '<div class="legend">' + state.categories.map(function (c) { return '<span><i class="dot" style="background:' + c.color + '"></i>' + esc(c.name) + '</span>'; }).join('') + '<span>' + I.gem(12) + 'Megjelenés</span>' + (state.settings.cycle && state.settings.cycle.on ? '<span>' + I.drop(12, true) + 'Menstruáció</span><span>' + I.drop(12, false) + 'Várható</span>' : '') + '</div>';

    // Kiválasztott nap
    var info = Sch.getDay(state, sel);
    var unused = sel < today && !state.days[sel];
    var items = info.items.filter(function (i) { return i.kind === 'activity' || i.kind === 'event' || i.kind === 'task'; });
    if (unused) items = items.filter(function (i) { return i.kind === 'event'; });
    var tasks = unused ? Sch.tasksFor(state, sel) : [], rel = Sch.releases(state, sel);
    h += '<div class="sec"><div class="between"><h2 class="h2">' + U.fmtLong(sel) + '</h2><div class="small muted">' + (items.length + tasks.length) + ' tétel</div></div>';
    h += cycleRow(state, sel);
    rel.forEach(function (r) {
      h += '<button type="button" class="release" style="border:0;text-align:left" data-a="open" data-s="treasure" data-id="' + r.id + '"><div style="width:38px;height:38px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center">' + I.gem(20) + '</div><div><div class="tiny" style="color:#7A5B33">Megjelenik a Kincsesládából</div><div style="font-size:15px;font-weight:600">' + esc(r.title) + '</div></div></button>';
    });
    if (!items.length && !tasks.length) h += '<div class="card"><div class="empty">' + (unused ? 'Ezen a napon még nem használtad az appot.' : 'Erre a napra nincs semmi betervezve.') + '<button type="button" class="btn-soft" data-a="open" data-s="entry" data-date="' + sel + '">' + I.plus + 'Esemény vagy feladat</button></div></div>';
    else {
      h += '<div class="card pad-s list">' + items.map(function (it) {
        var col = Sch.catColor(state, it.catId);
        var row = '<button type="button" class="drow" style="width:100%;border:0;background:none;text-align:left" data-a="open" data-s="item" data-date="' + sel + '" data-id="' + it.id + '"><span class="drow-time"' + (it.conflict ? ' style="color:#8A4B3A;font-weight:600"' : '') + '>' + (it.allDay ? 'egész' : (it.start != null ? U.toHM(it.start) : '–')) + '</span><span class="dot" style="background:' + col + '"></span><span class="drow-title"' + (it.done ? ' style="text-decoration:line-through;color:var(--faint)"' : '') + '>' + esc(it.title) + '</span><span class="drow-tag"' + (it.conflict ? ' style="color:#8A4B3A;font-weight:600"' : '') + '>' + (it.conflict ? 'ütközik' : esc(kindLabel(state, it))) + '</span></button>';
        if (it.conflict) row += '<div style="padding-bottom:12px">' + conflictCard(state, sel, it) + '</div>';
        return row;
      }).join('') + tasks.map(function (x) {
        var p = Sch.proj(state, x.projectId), col = Sch.catColor(state, x.catId || (p && p.catId));
        return '<div class="drow"><span class="drow-time">feladat</span>' + check(x.done, col, 'data-a="task" data-id="' + x.id + '"', 'Kész: ' + x.title, true) + '<button type="button" class="drow-title" style="border:0;background:none;text-align:left;padding:0" data-a="open" data-s="entry" data-edit="task" data-id="' + x.id + '">' + esc(x.title) + '</button></div>';
      }).join('') + '</div>';
    }
    h += '</div>';
    return h + '</main>';
  };

  /* ---------- PROJEKTEK ---------- */
  function projMeta(state, p) {
    var t = U.today();
    if (p.kind === 'collection') {
      var up = state.events.filter(function (e) { return e.projectId === p.id && e.date >= t; }).length + state.tasks.filter(function (x) { return x.projectId === p.id && !x.done; }).length;
      return up ? up + ' közelgő' : 'gyűjtő';
    }
    if (p.goal && p.goal.type === 'quantity' && p.goal.metricId) {
      var tot = (p.goal.start || 0) + Sch.metricTotal(state, p.goal.metricId);
      return U.num(tot) + (p.goal.target ? ' / ' + U.num(p.goal.target) : '') + ' ' + esc(p.goal.unit || '');
    }
    if (p.goal && p.goal.type === 'milestones') {
      var ts = state.tasks.filter(function (x) { return x.projectId === p.id; });
      if (ts.length) return ts.filter(function (x) { return x.done; }).length + ' / ' + ts.length + ' lépés';
    }
    if (p.countdown && p.deadline) return daysLeft(p.deadline) + ' nap a határidőig';
    var acts = state.activities.filter(function (a) { return a.projectId === p.id; });
    if (acts.length) {
      var a = acts[0];
      if (a.sched.type === 'quota') { var q = Sch.quotaStatus(state, a); return 'heti ' + q.done + ' / ' + q.k; }
      if (a.habit) { var s = Sch.streak(state, a); return s.cur + ' ' + s.unit + ' sorozat'; }
      return Sch.describe(a);
    }
    var open = state.tasks.filter(function (x) { return x.projectId === p.id && !x.done; }).length;
    return open ? open + ' nyitott feladat' : '';
  }
  V.proj = function (state, ui) {
    var t = U.today(), ws = U.weekStart(t);
    var bal = Sch.balance(state, ws, U.addDays(ws, 6));
    var h = '<main class="screen"><div class="between"><h1 class="h1" style="margin:0">Projektek</h1><button type="button" class="btn sm" data-a="open" data-s="projForm">' + I.plus + 'Új projekt</button></div>';
    state.categories.forEach(function (c) {
      var ps = state.projects.filter(function (p) { return p.catId === c.id && !p.archived; });
      var b = bal[c.id];
      h += '<div class="card pcard"><div class="row" style="gap:14px">' + chipIco(state, c.id) + '<div class="grow"><div class="h2" style="font-size:20px">' + esc(c.name) + '</div><div class="small muted" style="margin-top:3px">' +
        (b && b.planned ? 'E héten ' + U.num(b.done / 60, 1) + ' / ' + U.num(b.planned / 60, 1) + ' óra' : ps.length + ' projekt') + '</div></div></div>';
      if (ps.length) {
        h += '<div class="list">' + ps.map(function (p) {
          return '<button type="button" class="prow" data-a="open" data-s="proj" data-id="' + p.id + '"><span class="row" style="gap:10px;min-width:0">' + (p.kind === 'collection' ? '<span style="color:' + c.color + ';display:flex">' + catIconSvg(state, c.id, 18, true) + '</span>' : '') + '<span class="prow-name">' + esc(p.name) + '</span></span><span class="prow-meta">' + projMeta(state, p) + '</span></button>';
        }).join('') + '</div>';
      } else h += '<p class="help">Még nincs projekt ebben a kategóriában.</p>';
      h += '</div>';
    });
    var arch = state.projects.filter(function (p) { return p.archived; });
    if (arch.length) {
      h += '<button type="button" class="card between" style="border:0;width:100%" data-a="toggleArch"><span class="small muted">Archivált · ' + arch.length + '</span>' + (ui.showArch ? I.up : I.down) + '</button>';
      if (ui.showArch) h += '<div class="card pad-s list">' + arch.map(function (p) { return '<button type="button" class="prow" data-a="open" data-s="proj" data-id="' + p.id + '"><span class="prow-name" style="color:var(--faint)">' + esc(p.name) + '</span><span class="prow-meta">' + esc((Sch.cat(state, p.catId) || {}).name || '') + '</span></button>'; }).join('') + '</div>';
    }
    return h + '</main>';
  };

  /* ---------- JEGYZETEK ---------- */
  V.notes = function (state, ui) {
    var h = '<main class="screen"><h1 class="h1" style="margin:0">Jegyzetek</h1>';
    h += '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))"><button type="button" class="' + (ui.notes === 'ideas' ? 'on' : '') + '" data-a="notesTab" data-t="ideas" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="color:#96604F;display:flex">' + I.bulb + '</span>Ötletek</button><button type="button" class="' + (ui.notes === 'chest' ? 'on' : '') + '" data-a="notesTab" data-t="chest" style="display:flex;align-items:center;justify-content:center;gap:8px"><span style="color:#A07845;display:flex">' + I.chest + '</span>Kincsesláda</button></div>';
    return h + (ui.notes === 'ideas' ? ideas(state, ui) : chest(state, ui)) + '</main>';
  };
  function writeProjects(state) { return state.projects.filter(function (p) { return p.catId === 'write' && !p.archived; }); }
  function ideas(state, ui) {
    var q = ui.q, wps = writeProjects(state);
    var h = '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div class="label">Gyors ötlet</div>' +
      '<label for="q-title" class="hidden-label">Cím</label><input id="q-title" class="field title" placeholder="Cím" data-bindui="q.title" value="' + esc(q.title) + '">' +
      '<label for="q-body" class="hidden-label">Ötlet szövege</label><textarea id="q-body" class="field" rows="3" placeholder="Mi jutott eszedbe? Írd vagy mondd." data-bindui="q.body">' + esc(q.body) + '</textarea>' +
      '<div class="between"><label for="q-proj" class="hidden-label">Projekt</label><select id="q-proj" class="field" style="width:auto;max-width:55%;font-weight:600;color:#7B4E41;background-color:rgba(150,96,79,.12)" data-bindui="q.proj"><option value="">Besorolatlan</option>' +
      wps.map(function (p) { return '<option value="' + p.id + '"' + (q.proj === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '<option value="__new">+ Új kategória…</option></select>' +
      '<div class="row" style="gap:8px"><button type="button" class="icon-btn mic' + (ui.listening ? ' on' : '') + '" style="border-radius:50%;background:rgba(150,96,79,.12);color:#96604F;box-shadow:none" data-a="mic" aria-pressed="' + !!ui.listening + '" aria-label="Diktálás">' + I.mic + '</button><button type="button" class="btn" style="height:44px;border-radius:14px" data-a="saveIdea">Mentés</button></div></div></div>';
    var f = ui.ideaF;
    var counts = { all: state.ideas.length, none: state.ideas.filter(function (i) { return !i.projectId; }).length };
    h += '<div class="chips"><button type="button" class="chip ' + (f === 'all' ? 'dark' : 'white') + '" data-a="ideaF" data-f="all">Mind · ' + counts.all + '</button>' +
      wps.map(function (p) { var n = state.ideas.filter(function (i) { return i.projectId === p.id; }).length; return '<button type="button" class="chip ' + (f === p.id ? 'dark' : 'white') + '" data-a="ideaF" data-f="' + p.id + '">' + esc(p.name) + ' · ' + n + '</button>'; }).join('') +
      (counts.none ? '<button type="button" class="chip ' + (f === 'none' ? 'dark' : 'white') + '" data-a="ideaF" data-f="none">Besorolatlan · ' + counts.none + '</button>' : '') + '</div>';
    var list = state.ideas.filter(function (i) { return f === 'all' || (f === 'none' ? !i.projectId : i.projectId === f); }).sort(function (a, b) { return b.createdAt - a.createdAt; });
    if (!list.length) return h + '<div class="card"><div class="empty">' + C.svg('nyugodt', 72, true) + 'Még nincs itt ötlet. Ami eszedbe jut, írd vagy mondd be fent.</div></div>';
    h += '<div class="sec" style="gap:12px">' + list.map(function (i) {
      var p = Sch.proj(state, i.projectId);
      var body = i.body && i.body.length > 220 ? i.body.slice(0, 220) + '…' : i.body;
      return '<button type="button" class="card idea" data-a="open" data-s="idea" data-id="' + i.id + '"><span class="idea-title">' + esc(i.title) + '</span>' + (body ? '<span class="idea-body">' + esc(body) + '</span>' : '') +
        '<span class="between" style="width:100%">' + (p ? '<span class="tag" style="background:rgba(150,96,79,.12);color:#7B4E41">' + esc(p.name) + '</span>' : '<span class="tag" style="background:#F3EADD;color:#5E4E41">Besorolatlan</span>') +
        '<span class="tiny muted row" style="gap:5px">' + (i.dictated ? '<span style="display:flex">' + I.mic.replace('width="20" height="20"', 'width="13" height="13"') + '</span>diktálva · ' : '') + U.relDay(U.ymd(new Date(i.createdAt))) + '</span></span></button>';
    }).join('') + '</div>';
    return h;
  }
  var TTYPES = [['book', 'Könyv'], ['gadget', 'Kütyü'], ['series', 'Sorozat'], ['film', 'Film'], ['other', 'Egyéb']];
  V.TTYPES = TTYPES;
  function tIcon(type) {
    var ic = {
      book: CAT_ICONS.write,
      gadget: '<rect x="5.5" y="2.5" width="13" height="19" rx="2.6" ' + F + '></rect><rect x="5.5" y="2.5" width="13" height="19" rx="2.6" ' + S + '></rect><path d="M10.5 18.2h3M8.5 6.5h7M8.5 9.5h7M8.5 12.5h4" ' + S + '></path>',
      series: '<rect x="3" y="5" width="18" height="12.5" rx="2.5" ' + F + '></rect><rect x="3" y="5" width="18" height="12.5" rx="2.5" ' + S + '></rect><path d="M8 21h8M9 2.5l3 2.5 3-2.5" ' + S + '></path>',
      film: '<rect x="3" y="5" width="18" height="14" rx="2.5" ' + F + '></rect><rect x="3" y="5" width="18" height="14" rx="2.5" ' + S + '></rect><path d="M7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" ' + S + '></path>',
      other: '<path d="M6 3h12l4 6-10 12L2 9Z" ' + F + '></path><path d="M6 3h12l4 6-10 12L2 9ZM2 9h20" ' + S + '></path>'
    }[type] || CAT_ICONS.dot;
    return '<div class="chip-ico" style="width:44px;height:44px;border-radius:14px;background:rgba(160,120,69,.16);color:#A07845">' + svg(22, ic) + '</div>';
  }
  function tLabel(type) { var f = TTYPES.find(function (x) { return x[0] === type; }); return f ? f[1] : 'Egyéb'; }
  function where(t) {
    if (!t.seen && !t.buy && !t.link) return '';
    return '<div class="treasure-where">' + (t.seen ? '<div><b>Láttam</b><span>' + esc(t.seen) + '</span></div>' : '') + (t.buy ? '<div><b>Kapható</b><span>' + esc(t.buy) + '</span></div>' : '') + '</div>';
  }
  function chest(state, ui) {
    var t = U.today(), f = ui.trF;
    var all = state.treasures.filter(function (x) { return f === 'all' || x.type === f; });
    var h = '<div class="chips"><button type="button" class="chip ' + (f === 'all' ? 'dark' : 'white') + '" data-a="trF" data-f="all">Mind · ' + state.treasures.filter(function (x) { return !x.got; }).length + '</button>' +
      TTYPES.map(function (ty) { var n = state.treasures.filter(function (x) { return x.type === ty[0] && !x.got; }).length; return n || f === ty[0] ? '<button type="button" class="chip ' + (f === ty[0] ? 'dark' : 'white') + '" data-a="trF" data-f="' + ty[0] + '">' + ty[1] + ' · ' + n + '</button>' : ''; }).join('') + '</div>';
    h += '<button type="button" class="btn block" style="height:50px" data-a="open" data-s="treasure">' + I.plus + 'Új kincs</button>';
    var soon = all.filter(function (x) { return !x.got && x.date && x.date >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var out = all.filter(function (x) { return !x.got && x.date && x.date < t; });
    var any = all.filter(function (x) { return !x.got && !x.date; });
    var got = all.filter(function (x) { return x.got; });
    if (!soon.length && !out.length && !any.length && !got.length) return h + '<div class="card"><div class="empty">' + C.svg('nyugodt', 72, true) + 'Ide gyűlnek a könyvek, kütyük, sorozatok, amiket meg akarsz szerezni. Ha megadod a megjelenés napját, aznap szólok.</div></div>';
    if (soon.length) {
      h += '<div class="sec" style="gap:12px"><div class="label">Hamarosan megjelenik</div>' + soon.map(function (x) {
        var dl = daysLeft(x.date);
        return '<button type="button" class="card" style="border:0;text-align:left;display:flex;flex-direction:column;gap:14px" data-a="open" data-s="treasure" data-id="' + x.id + '"><span class="row" style="align-items:flex-start;gap:14px;width:100%">' + tIcon(x.type) +
          '<span class="grow" style="display:flex;flex-direction:column;gap:4px"><span style="font-size:15.5px;font-weight:600;line-height:1.3">' + esc(x.title) + '</span><span class="small muted">' + tLabel(x.type) + '</span></span>' +
          '<span style="display:flex;flex-direction:column;align-items:flex-end;gap:2px"><span class="serif" style="font-size:19px;font-weight:600;color:' + (dl <= 3 ? '#7A5B33' : 'var(--ink)') + '">' + U.fmtShort(x.date) + '</span><span class="tiny" style="' + (dl <= 3 ? 'color:#7A5B33;font-weight:600' : 'color:var(--muted)') + '">' + (dl === 0 ? 'ma' : dl === 1 ? 'holnap' : dl + ' nap') + '</span></span></span>' + where(x) + '</button>';
      }).join('') + '</div>';
    }
    if (out.length) h += listSection('Már kapható', out);
    if (any.length) h += listSection('Bármikor', any);
    if (got.length) {
      h += '<button type="button" class="card between" style="border:0;width:100%" data-a="toggleGot"><span class="small muted">Megszerezve · ' + got.length + '</span>' + (ui.showGot ? I.up : I.down) + '</button>';
      if (ui.showGot) h += listSection('', got);
    }
    return h;
    function listSection(title, arr) {
      return '<div class="sec" style="gap:12px">' + (title ? '<div class="label">' + title + '</div>' : '') + '<div class="card pad-s list">' + arr.map(function (x) {
        return '<button type="button" class="drow" style="width:100%;border:0;background:none;text-align:left" data-a="open" data-s="treasure" data-id="' + x.id + '"><span class="dot" style="background:#A07845"></span><span class="grow" style="display:flex;flex-direction:column;gap:3px"><span style="font-size:14.5px;font-weight:500;' + (x.got ? 'color:var(--faint);text-decoration:line-through' : '') + '">' + esc(x.title) + '</span><span class="small muted">' + tLabel(x.type) + (x.seen ? ' · ' + esc(x.seen) : '') + (x.date ? ' · ' + U.fmtShort(x.date) : '') + '</span></span></button>';
      }).join('') + '</div></div>';
    }
  }

  /* ---------- EREDMÉNYEK ---------- */
  V.res = function (state, ui) {
    var t = U.today(), n = ui.res, from = U.addDays(t, -(n - 1));
    var h = '<main class="screen"><div class="between"><h1 class="h1" style="margin:0">Eredmények</h1><div style="width:150px">' +
      seg([[7, 'Hét'], [30, 'Hónap']], n, function (v) { return 'data-a="res" data-n="' + v + '"'; }) + '</div></div>';
    var used = Object.keys(state.days).filter(function (d) { return d >= from && d <= t; }).length;
    var wrote = 0;
    for (var d = from; d <= t; d = U.addDays(d, 1)) if (state.metricLogs[d] && state.metricLogs[d].m_words > 0) wrote++;
    var bestHabit = null;
    state.activities.filter(function (a) { return a.habit; }).forEach(function (a) { var s = Sch.streak(state, a); if (!bestHabit || s.cur > bestHabit.s.cur) bestHabit = { a: a, s: s }; });
    if (used < 2) h += say('nyugodt', 'Itt fognak gyűlni az eredményeid. Pár nap után már lesz mit mutatnom.');
    else h += say(wrote >= Math.ceil(n * .6) ? 'buszke' : 'beszel', 'Az elmúlt ' + n + ' napból ' + wrote + ' napon írtál.' + (bestHabit && bestHabit.s.cur >= 3 ? ' ' + esc(bestHabit.a.title) + ': ' + bestHabit.s.cur + ' ' + bestHabit.s.unit + ' egymás után.' : ''));

    // Egyensúly
    var bal = Sch.balance(state, from, t);
    var rows = state.categories.filter(function (c) { return bal[c.id] && bal[c.id].planned; });
    if (rows.length) {
      var max = Math.max.apply(null, rows.map(function (c) { return bal[c.id].planned; }));
      h += '<div class="card" style="display:flex;flex-direction:column;gap:18px"><div><div class="label">Egyensúly</div><div class="small muted" style="margin-top:4px">Halvány: tervezett · telt: elvégzett</div></div>' + rows.map(function (c) {
        var b = bal[c.id];
        return '<div style="display:flex;flex-direction:column;gap:8px"><div class="between"><span style="font-size:14.5px;font-weight:500">' + esc(c.name) + '</span><span class="small muted">' + U.num(b.done / 60, 1) + ' / ' + U.num(b.planned / 60, 1) + ' óra</span></div>' +
          '<div style="height:8px;border-radius:4px;background:#F5EEE4"><div style="width:' + Math.round(b.planned / max * 100) + '%;height:8px;border-radius:4px;background:' + U.hexA(c.color, .22) + '"><div style="width:' + Math.min(100, Math.round(b.done / b.planned * 100)) + '%;height:8px;border-radius:4px;background:' + c.color + '"></div></div></div></div>';
      }).join('') + '</div>';
    }

    // Szószám
    var mw = state.metrics.find(function (m) { return m.id === 'm_words'; });
    if (mw) {
      var nb = n === 7 ? 7 : 30, vals = [], days = [];
      for (var i = nb - 1; i >= 0; i--) { var dd = U.addDays(t, -i); days.push(dd); vals.push((state.metricLogs[dd] || {}).m_words || 0); }
      var sum = vals.reduce(function (a, b) { return a + b; }, 0), top = Math.max(mw.target || 0, Math.max.apply(null, vals)) * 1.15 || 1;
      h += '<div class="card" style="display:flex;flex-direction:column;gap:18px"><div class="between" style="align-items:flex-end"><div><div class="label">Szószám</div><div class="row" style="gap:8px;align-items:baseline;margin-top:4px"><span class="big-num" style="font-size:36px;color:#96604F">' + U.num(sum) + '</span><span class="small muted">szó / ' + nb + ' nap</span></div></div>' + (mw.target ? '<div class="small muted">napi cél ' + U.num(mw.target) + '</div>' : '') + '</div>' +
        '<div style="position:relative">' + (mw.target ? '<div style="position:absolute;left:0;right:0;top:' + Math.round(120 - mw.target / top * 120) + 'px;border-top:1.5px dashed #DCCDBA"></div>' : '') +
        '<div class="bars" style="grid-template-columns:repeat(' + nb + ',minmax(0,1fr))' + (nb > 7 ? ';gap:3px' : '') + '">' + vals.map(function (v, k) {
          var today = k === vals.length - 1;
          return '<i style="height:' + Math.max(4, Math.round(v / top * 120)) + 'px;background:' + (v === 0 ? '#EFE5D8' : today ? '#96604F' : 'rgba(150,96,79,.55)') + (nb > 7 ? ';border-radius:4px' : '') + '" title="' + U.fmtShort(days[k]) + ': ' + v + '"></i>';
        }).join('') + '</div></div>' +
        (nb === 7 ? '<div class="bar-labels" style="grid-template-columns:repeat(7,minmax(0,1fr))">' + days.map(function (dd, k) { return '<span style="' + (k === 6 ? 'color:var(--ink);font-weight:600' : '') + '">' + U.DAYS_SHORT[U.dow(dd)] + '</span>'; }).join('') + '</div>' : '<div class="between tiny muted"><span>' + U.fmtShort(days[0]) + '</span><span>ma</span></div>') + '</div>';
    }

    // Testsúly
    var ser = Sch.weightSeries(state).slice(-12), nw = Sch.nextWeigh(state, U.addDays(t, (state.metricLogs[t] && state.metricLogs[t].m_weight != null) ? 1 : 0));
    h += '<div class="card" style="display:flex;flex-direction:column;gap:16px"><div class="between" style="align-items:flex-end"><div><div class="label">Testsúly · ' + U.DAYS[state.settings.weighDay] + 'onként</div>' +
      (ser.length ? '<div class="row" style="gap:8px;align-items:baseline;margin-top:4px"><span class="big-num" style="font-size:36px;color:#5D6649">' + U.num(ser[ser.length - 1].v, 1) + '</span><span class="small muted">kg · ' + U.fmtShort(ser[ser.length - 1].date) + '</span></div>' : '') + '</div>' +
      (ser.length > 1 ? '<div class="small" style="font-weight:600;color:#5D6649">' + (ser[ser.length - 1].v - ser[0].v <= 0 ? '−' : '+') + U.num(Math.abs(ser[ser.length - 1].v - ser[0].v), 1) + ' kg / ' + (ser.length - 1) + ' hét</div>' : '') + '</div>';
    if (ser.length > 1) h += weightChart(ser);
    else if (!ser.length) h += '<p class="help">Az első mérés után itt rajzolódik ki a görbe.</p>';
    h += '<div class="between"><span class="small muted">Következő mérés: ' + U.relDay(nw) + (U.relDay(nw) === 'ma' || U.relDay(nw) === 'holnap' ? '' : '') + '</span><button type="button" class="btn-soft" data-a="open" data-s="weight">' + I.plus + 'Mérés</button></div></div>';

    // Mennyiségi célok
    state.projects.filter(function (p) { return !p.archived && p.goal && p.goal.type === 'quantity' && p.goal.metricId && p.goal.target; }).forEach(function (p) {
      var tot = (p.goal.start || 0) + Sch.metricTotal(state, p.goal.metricId), col = Sch.catColor(state, p.catId);
      h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><div class="between"><span style="font-size:15px;font-weight:600">' + esc(p.name) + '</span><span class="small muted">' + U.num(tot) + ' / ' + U.num(p.goal.target) + ' ' + esc(p.goal.unit) + '</span></div><div class="bar"><i style="width:' + Math.min(100, Math.round(tot / p.goal.target * 100)) + '%;background:' + col + '"></i></div></div>';
    });

    // Szokások
    var habits = state.activities.filter(function (a) { return a.habit; });
    if (habits.length) {
      h += '<div class="card" style="display:flex;flex-direction:column;gap:18px"><div class="between"><div class="label">Szokások · 14 nap</div><div class="tiny muted">sorozat / rekord</div></div>' + habits.map(function (a) {
        var s = Sch.streak(state, a), col = Sch.catColor(state, (Sch.proj(state, a.projectId) || {}).catId);
        return '<div style="display:flex;flex-direction:column;gap:8px"><div class="between"><span style="font-size:14.5px;font-weight:500">' + esc(a.title) + '</span><span class="small" style="font-weight:600;color:' + col + '">' + s.cur + ' / ' + s.best + ' ' + s.unit + '</span></div><div class="hgrid">' +
          Sch.habitGrid(state, a, 14).map(function (g) { return '<i style="' + (g.state === 'done' ? 'background:' + col : g.state === 'off' ? 'background:#FAF5EE' : g.state === 'today' ? 'background:#F2EADF;box-shadow:inset 0 0 0 1.5px ' + U.hexA(col, .5) : '') + '" title="' + U.fmtShort(g.date) + '"></i>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
    }

    // Apró számok
    var kc = Sch.metricSum(state, 'm_kcal', from, t), wk = Sch.metricSum(state, 'm_walk', from, t), ap = Sch.metricSum(state, 'm_apps', from, t);
    var scr = 0, scrN = 0;
    for (var d2 = from; d2 <= t; d2 = U.addDays(d2, 1)) { var dy = state.days[d2]; if (dy && dy.screenOk != null) { scrN++; if (dy.screenOk) scr++; } }
    h += '<div class="minis">' +
      mini('Kalória átlag', kc.n ? U.num(kc.sum / kc.n) : '–', 'kcal / nap') +
      mini('Séta átlag', wk.n ? U.num(wk.sum / wk.n) + ' perc' : '–', 'cél 30 / nap') +
      mini('Jelentkezések', U.num(ap.sum), n === 7 ? 'az elmúlt héten' : 'az elmúlt hónapban') +
      mini('Képernyő ' + state.settings.screenCut + '-ig', scrN ? scr + ' / ' + scrN : '–', 'nap betartva') + '</div>';
    return h + '</main>';
    function mini(l, v, s) { return '<div class="mini"><div class="small muted">' + l + '</div><div class="big-num">' + v + '</div><div class="tiny muted">' + s + '</div></div>'; }
  };
  function weightChart(ser) {
    var vs = ser.map(function (x) { return x.v; });
    var top = Math.max.apply(null, vs) + .4, bot = Math.min.apply(null, vs) - .4;
    var W = 320, H = 130;
    function X(i) { return 12 + i * ((W - 30) / Math.max(1, ser.length - 1)); }
    function Y(v) { return 10 + (top - v) / (top - bot) * (H - 20); }
    var line = ser.map(function (x, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x.v).toFixed(1); }).join('');
    var dots = ser.slice(0, -1).map(function (x, i) { return 'M' + X(i).toFixed(1) + ' ' + Y(x.v).toFixed(1) + 'h0'; }).join('');
    var li = ser.length - 1;
    var grid = '', g0 = Math.ceil(bot), g1 = Math.floor(top);
    for (var g = g0; g <= g1; g++) if (g1 - g0 <= 4 || g % 2 === 0) grid += '<line x1="6" x2="' + (W - 22) + '" y1="' + Y(g).toFixed(1) + '" y2="' + Y(g).toFixed(1) + '" stroke="#F0E5D7"></line><text x="' + W + '" y="' + (Y(g) + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#6B5B4E" font-family="Inter, sans-serif">' + g + '</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto;display:block" role="img" aria-label="Testsúly hétről hétre">' + grid +
      '<path d="' + line + '" fill="none" stroke="#6F7A5A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '<path d="' + dots + '" fill="none" stroke="#6F7A5A" stroke-width="8" stroke-linecap="round"></path><path d="' + dots + '" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"></path>' +
      '<circle cx="' + X(li).toFixed(1) + '" cy="' + Y(ser[li].v).toFixed(1) + '" r="5.5" fill="#5D6649"></circle></svg>' +
      '<div class="between tiny muted" style="padding-right:24px"><span>' + U.fmtShort(ser[0].date) + '</span><span>' + U.fmtShort(ser[li].date) + '</span></div>';
  }

  /* ---------- LAPOK ---------- */
  function sheetHead(title, right) {
    return '<div class="sheet-head"><button type="button" class="icon-btn plain" data-a="close" aria-label="Bezárás">' + I.close + '</button><h2 class="h2">' + title + '</h2>' + (right || '<span style="width:44px"></span>') + '</div>';
  }
  V.sheet = function (state, ui) {
    var s = ui.sheet, fn = SHEETS[s.type];
    return '<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-in">' + (fn ? fn(state, ui, s) : '') + '</div></div>';
  };
  var SHEETS = {};

  SHEETS.settings = function (state, ui) {
    var st = state.settings;
    function trow(label, key) { return '<div class="frow"><label for="st-' + key + '">' + label + '</label><input id="st-' + key + '" type="time" class="field sm" value="' + esc(st[key]) + '" data-change="setting" data-k="' + key + '"></div>'; }
    var h = sheetHead('Beállítások');
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">A napod váza</div>' + trow('Ébredés', 'wake') + trow('Munka kezdete', 'workStart') + trow('Munka vége', 'workEnd') + trow('Ebéd', 'lunch') + trow('Képernyő vége, esti zárás', 'screenCut') +
      '<div class="frow"><label for="st-wd">Mérlegelés napja</label><select id="st-wd" class="field" style="width:150px" data-change="setting" data-k="weighDay">' + U.DAYS.map(function (d, i) { return '<option value="' + i + '"' + (i === st.weighDay ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></div>' +
      '<p class="help">A változás holnaptól érvényes, a mai, már összeállított napot nem rendezi át.</p></div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Kategóriák</div>' + state.categories.map(function (c) {
      return '<div style="display:flex;flex-direction:column;gap:10px;padding-bottom:6px"><div class="row"><span class="dot" style="background:' + c.color + ';width:14px;height:14px"></span><label for="cat-' + c.id + '" class="hidden-label">Kategória neve</label><input id="cat-' + c.id + '" class="field" value="' + esc(c.name) + '" data-change="catName" data-id="' + c.id + '"></div>' +
        '<div class="chips" style="gap:6px">' + CA.store.PALETTE.map(function (col) { return '<button type="button" aria-label="Szín ' + col + '" data-a="catColor" data-id="' + c.id + '" data-c="' + col + '" style="width:28px;height:28px;border-radius:50%;border:' + (col === c.color ? '3px solid var(--ink)' : '0') + ';background:' + col + '"></button>'; }).join('') + '</div></div>';
    }).join('') + '<button type="button" class="btn-soft" style="align-self:flex-start" data-a="open" data-s="newcat">' + I.plus + 'Új kategória</button></div>';
    var cy = st.cycle || {}, lastStart = (state.periods || []).slice().sort().pop() || '', avg = Sch.cycleAvg(state), nxt = Sch.cycleNext(state);
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="frow"><div><div class="label">Ciklusnaptár</div><div class="small muted" style="margin-top:4px">Csak a Naptárban látszik, cseppel jelölve</div></div>' + sw(!!cy.on, 'data-a="cycleToggle"', 'Ciklusnaptár') + '</div>';
    if (cy.on) {
      h += '<div class="frow"><label for="cy-last">Utolsó menstruáció kezdete</label><input id="cy-last" type="date" class="field" style="width:170px" value="' + esc(lastStart) + '" data-change="periodLast"></div>' +
        '<div class="frow"><label for="cy-len">Ciklus hossza (nap)</label><input id="cy-len" class="field sm" inputmode="numeric" value="' + esc(cy.len) + '" data-change="cycle" data-k="len"></div>' +
        '<div class="frow"><label for="cy-per">Menstruáció hossza (nap)</label><input id="cy-per" class="field sm" inputmode="numeric" value="' + esc(cy.period) + '" data-change="cycle" data-k="period"></div>' +
        (avg ? '<div class="frow"><span class="small muted">A rögzített ciklusaid átlaga: ' + avg + ' nap</span>' + (avg !== +cy.len ? '<button type="button" class="btn-link" data-a="cycleUseAvg" data-v="' + avg + '">Ezt használjuk</button>' : '') + '</div>' : '') +
        (nxt ? '<p class="help">Következő várható kezdet: ' + U.fmtLong(nxt) + '.</p>' : '<p class="help">Add meg az utolsó kezdet dátumát, és onnan számolom a következőket.</p>') +
        '<p class="help">Ha elkezdődik, a Naptárban az adott napra koppintva rögzítheted; a becslés onnantól ehhez igazodik. Ez a megadott hosszakból számolt becslés, nem orvosi előrejelzés.</p>';
    }
    h += '</div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Biztonsági mentés</div><p class="help" style="font-size:14px">Az adataid ezen a telefonon vannak. A mentés egy fájl, amit a megosztás menüből a Google Drive-ra küldhetsz; telefoncserénél ebből állítod vissza.</p>' +
      '<p class="help">' + (st.lastBackup ? 'Utolsó mentés: ' + U.fmtDate(st.lastBackup) : 'Még nem készült mentés.') + ' · ' + (ui.persisted ? 'A tárolás tartós.' : 'A böngésző szükség esetén törölheti az adatokat — a rendszeres mentés ezért fontos.') + '</p>' +
      '<button type="button" class="btn" data-a="backup">Mentés most</button>' +
      '<label class="btn" style="background:var(--field);color:var(--ink)" for="imp">Visszaállítás fájlból</label><input id="imp" type="file" accept=".txt,.json,text/plain,application/json" class="hidden-label" data-change="import"></div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><div class="label">Az appról</div><p class="help" style="font-size:14px">Callan · ' + CA.VERSION + '</p><p class="help">Időzített értesítések egy későbbi verzióban jönnek. Addig Callan az app megnyitásakor szól.</p>' +
      '<button type="button" class="btn-danger" style="align-self:flex-start" data-a="resetAll">Minden adat törlése</button></div>';
    return h;
  };

  SHEETS.newcat = function (state, ui, s) {
    var d = s.draft;
    return sheetHead('Új kategória') + '<div class="card" style="display:flex;flex-direction:column;gap:14px"><label for="nc-name" class="label">Név</label><input id="nc-name" class="field title" placeholder="pl. Család" value="' + esc(d.name) + '" data-bind="name">' +
      '<div class="label">Szín</div><div class="chips">' + CA.store.PALETTE.map(function (col) { return '<button type="button" aria-label="Szín ' + col + '" data-a="d" data-k="color" data-v="' + col + '" style="width:36px;height:36px;border-radius:50%;border:' + (col === d.color ? '3px solid var(--ink)' : '0') + ';background:' + col + '"></button>'; }).join('') + '</div></div>' +
      '<button type="button" class="btn block" data-a="saveCat">Kategória mentése</button>';
  };

  SHEETS.item = function (state, ui, s) {
    var info = Sch.getDay(state, s.date), it = info.items.find(function (i) { return i.id === s.id; });
    if (!it) return sheetHead('Tétel') + '<div class="card"><p class="help">Ez a tétel már nincs ezen a napon.</p></div>';
    var col = Sch.catColor(state, it.catId), inTop = (info.top3 || []).indexOf(it.id) >= 0;
    var h = sheetHead(U.cap(U.relDay(s.date)));
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="row" style="gap:14px">' + chipIco(state, it.catId) + '<div class="grow"><div class="h2" style="font-size:20px">' + esc(it.title) + '</div><div class="small" style="color:' + col + ';margin-top:4px">' + esc(kindLabel(state, it)) + ' · ' + (it.start != null ? U.toHM(it.start) + '–' + U.toHM(it.end) : (it.allDay ? 'egész nap' : 'nincs időpontja')) + '</div></div></div>' +
      (it.conflict ? '<p class="help" style="color:#8A4B3A">Ütközik ezzel: ' + esc(it.conflictWith) + '.</p>' : '') + '</div>';
    if (info.fixed) {
      h += '<button type="button" class="btn block" style="background:' + (it.done ? 'var(--field);color:var(--ink)' : col) + '" data-a="done" data-date="' + s.date + '" data-id="' + it.id + '">' + (it.done ? 'Mégsem kész' : 'Kész') + '</button>';
      if (it.kind === 'activity' || it.kind === 'task') h += '<div class="card frow"><div><div style="font-weight:600;font-size:15px">A mai három dolog egyike</div><div class="small muted">Legfeljebb három lehet</div></div>' + sw(inTop, 'data-a="star" data-date="' + s.date + '" data-id="' + it.id + '"', 'Fő dolog') + '</div>';
    }
    if (it.kind === 'activity') {
      h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div class="label">Áthelyezés ezen a napon</div><div class="frow"><label for="it-time">Új kezdés</label><input id="it-time" type="time" class="field sm" value="' + (it.start != null ? U.toInputTime(it.start) : '') + '"></div>' +
        '<button type="button" class="btn-soft" style="align-self:flex-start" data-a="itemTime" data-date="' + s.date + '" data-id="' + it.id + '">Áthelyezés</button></div>';
      var a = Sch.act(state, it.refId);
      h += '<div class="chips">' + (a && a.sched.type !== 'daily' && a.sched.type !== 'weekdays' ? '<button type="button" class="btn-white" data-a="resolve" data-date="' + s.date + '" data-id="' + it.id + '" data-how="tomorrow">Másnapra</button>' : '') +
        '<button type="button" class="btn-white" style="color:#8A4B3A" data-a="resolve" data-date="' + s.date + '" data-id="' + it.id + '" data-how="skip">Aznap kimarad</button>' +
        (a ? '<button type="button" class="btn-white" data-a="open" data-s="proj" data-id="' + a.projectId + '">Projekt megnyitása</button>' : '') + '</div>';
    }
    if (it.kind === 'task') {
      var tk = Sch.task(state, it.refId);
      if (tk && tk.mode === 'due') h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><div class="between"><span class="label">Haladás</span><span class="small muted">' + hoursTxt(tk) + '</span></div><div class="bar"><i style="width:' + Math.min(100, Math.round((tk.spent || 0) / (tk.est || 1) * 100)) + '%;background:' + col + '"></i></div><p class="help">Ha ezt a blokkot kipipálod, az ideje levonódik, a maradék pedig újraoszlik a határidőig (' + U.fmtLong(tk.due) + ').</p></div>';
      h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div class="label">Áthelyezés ezen a napon</div><div class="frow"><label for="it-time">Új kezdés</label><input id="it-time" type="time" class="field sm" value="' + (it.start != null ? U.toInputTime(it.start) : '') + '"></div>' +
        '<button type="button" class="btn-soft" style="align-self:flex-start" data-a="itemTime" data-date="' + s.date + '" data-id="' + it.id + '">Áthelyezés</button></div>';
      h += '<div class="chips"><button type="button" class="btn-white" data-a="resolve" data-date="' + s.date + '" data-id="' + it.id + '" data-how="tomorrow">' + (tk && tk.mode === 'due' ? 'Ma nem, osszuk el máskorra' : 'Másnapra') + '</button>' +
        '<button type="button" class="btn-white" data-a="open" data-s="entry" data-edit="task" data-id="' + it.refId + '">Feladat szerkesztése</button>' +
        (tk && tk.projectId ? '<button type="button" class="btn-white" data-a="open" data-s="proj" data-id="' + tk.projectId + '">Projekt megnyitása</button>' : '') + '</div>';
    }
    if (it.kind === 'event') h += '<button type="button" class="btn-soft" style="align-self:flex-start" data-a="open" data-s="entry" data-edit="event" data-id="' + it.refId + '">Esemény szerkesztése</button>';
    return h;
  };

  var EST_CHIPS = [['0,25', '15 perc'], ['0,5', '30 perc'], ['1', '1 óra'], ['2', '2 óra'], ['4', '4 óra']];
  function taskFields(state, d) {
    var due = d.tmode === 'due';
    var h = '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Ütemezés</div>' +
      seg([['day', 'Adott napon'], ['due', 'Határidőig']], d.tmode, function (v) { return 'data-a="d" data-k="tmode" data-v="' + v + '"'; });
    if (!due) {
      h += '<p class="help">Egy konkrét napon intézed el. Időpont nélkül szabad helyet keresek neki az idővonalon.</p>' +
        '<label for="e-date" class="label">Melyik napon?</label><input id="e-date" type="date" class="field" value="' + esc(d.date) + '" data-bind="date">' +
        '<div class="frow"><label for="e-time">Kezdés (nem kötelező)</label><input id="e-time" type="time" class="field sm" value="' + esc(d.time) + '" data-bind="time"></div>' +
        '<p class="help">Nap nélkül a vasárnapi heti tervezésnél osztod be.</p>';
    } else {
      h += '<p class="help">Hosszabb munka: a rászánt időt felosztom a határidőig hátralévő napokra, és beteszem az idővonalra.</p>' +
        '<label for="e-due" class="label">Határidő</label><input id="e-due" type="date" class="field" value="' + esc(d.due) + '" data-bind="due" data-rerender="1">';
    }
    h += '<div class="label">Rászánt idő</div><div class="chips">' + EST_CHIPS.map(function (c) {
      var on = d.estH === c[0];
      return '<button type="button" class="chip' + (on ? ' dark' : '') + '" aria-pressed="' + on + '" data-a="d" data-k="estH" data-v="' + c[0] + '">' + c[1] + '</button>';
    }).join('') + '</div>' +
      '<div class="frow"><label for="e-est">Vagy pontosan (óra)</label><input id="e-est" class="field sm" inputmode="decimal" value="' + esc(d.estH) + '" placeholder="' + (due ? 'pl. 10' : '0,5') + '" data-bind="estH" data-rerender="1"></div>';
    if (!due) h += '<p class="help">Ha üresen hagyod, fél órát foglalok neki.</p>';
    if (due) {
      h += '<div class="label">Egy alkalom legfeljebb</div><div class="chips">' + [[30, '30 perc'], [60, '1 óra'], [90, '1,5 óra'], [120, '2 óra']].map(function (c) {
        var on = +d.chunk === c[0];
        return '<button type="button" class="chip' + (on ? ' dark' : '') + '" aria-pressed="' + on + '" data-a="d" data-k="chunk" data-v="' + c[0] + '">' + c[1] + '</button>';
      }).join('') + '</div>';
      if (d.spent) h += '<p class="help">Eddig elvégezve: ' + hrs(d.spent) + '.</p>';
    }
    h += '</div>';
    if (due) {
      var est = estMinutes(d.estH);
      if (d.due && est) {
        var temp = { id: d.editId || '__preview', mode: 'due', due: d.due, est: est, chunk: +d.chunk || 60, spent: d.spent || 0, catId: d.catId, projectId: d.projectId || null };
        var plan = Sch.taskPlan(state, temp), days = Object.keys(plan).sort();
        var rem = est - (d.spent || 0);
        if (rem <= 0) h += say('buszke', 'Ezt már ledolgoztad.');
        else if (!days.length) h += say('nyugodt', 'Ez a határidő már elmúlt. Válassz egy későbbi napot.');
        else {
          var max = Math.max.apply(null, days.map(function (k) { return plan[k]; }));
          h += say(max > 180 ? 'nyugodt' : 'beszel', hrs(rem) + ' ' + U.untilDay(d.due) + ': ' + (days.length === 1 ? 'egy alkalomra' : days.length + ' napra') + ' osztom' + (days.length > 1 ? ', legfeljebb ' + hrs(max) + ' egy nap' : '') + '. Az első: ' + U.relDay(days[0]) + '.' + (max > 180 ? ' Ez szoros lesz — érdemes későbbi határidőt vagy kevesebb időt adni.' : ''));
        }
      }
    }
    return h;
  }
  function estMinutes(v) { var n = U.parseNum(v); return n && n > 0 ? Math.max(5, Math.round(n * 60 / 5) * 5) : null; }
  V.estMinutes = estMinutes;

  SHEETS.entry = function (state, ui, s) {
    var d = s.draft, isEv = d.mode === 'event';
    var h = sheetHead(d.editId ? 'Szerkesztés' : 'Új bejegyzés');
    if (!d.editId) h += seg([['event', 'Esemény'], ['task', 'Feladat']], d.mode, function (v) { return 'data-a="d" data-k="mode" data-v="' + v + '"'; });
    h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><label for="e-title" class="label">' + (isEv ? 'Mi lesz?' : 'Mit kell elintézni?') + '</label><input id="e-title" class="field title" value="' + esc(d.title) + '" data-bind="title" placeholder="' + (isEv ? 'pl. Szülői értekezlet' : 'pl. Osztálypénz befizetése') + '"></div>';
    if (isEv) {
      h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Mikor</div><label for="e-date" class="hidden-label">Dátum</label><input id="e-date" type="date" class="field" value="' + esc(d.date) + '" data-bind="date" data-rerender="1">' +
        '<div class="frow"><span class="flabel">Egész napos</span>' + sw(d.allDay, 'data-a="dToggle" data-k="allDay"', 'Egész napos') + '</div>' +
        (d.allDay ? '' : '<div class="frow"><label for="e-start">Kezdés</label><input id="e-start" type="time" class="field sm" value="' + esc(d.start) + '" data-bind="start" data-rerender="1"></div><div class="frow"><label for="e-end">Vége</label><input id="e-end" type="time" class="field sm" value="' + esc(d.end) + '" data-bind="end" data-rerender="1"></div>' +
          '<div class="frow"><label for="e-travel">Odaút előtte (perc)</label><input id="e-travel" class="field sm" inputmode="numeric" value="' + esc(d.travel || '') + '" placeholder="0" data-bind="travel" data-rerender="1"></div><p class="help">Az idővonalon a kezdés előtt ezt az időt is lefoglalja.</p>') + '</div>';
    } else h += taskFields(state, d);
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Kategória</div>' + catChips(state, d.catId, function (id) { return 'data-a="d" data-k="catId" data-v="' + id + '"'; }, true) +
      '<label for="e-proj" class="label">Projekt</label><select id="e-proj" class="field" data-bind="projectId" data-rerender="1">' + projOptions(state, d.projectId) + '</select><p class="help">Nem kötelező. Ha egy projekthez rendeled, annak a listájában is megjelenik.</p></div>';
    if (isEv) h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><label for="e-note" class="label">Jegyzet</label><textarea id="e-note" class="field" rows="2" placeholder="pl. vinni: aláírt nyomtatvány" data-bind="note">' + esc(d.note) + '</textarea></div>';

    // Ütközések
    if (isEv && d.date && !d.allDay && d.start) {
      var s0 = U.toMin(d.start) - (parseInt(d.travel, 10) || 0), e0 = U.toMin(d.end) || (U.toMin(d.start) + 60);
      var info = Sch.getDay(state, d.date);
      var hits = info.items.filter(function (i) { return i.kind === 'activity' && i.start != null && i.start < e0 && s0 < i.end; });
      hits.forEach(function (it) {
        var a = Sch.act(state, it.refId), canMove = a && a.sched.type !== 'daily' && a.sched.type !== 'weekdays';
        var r = (d.res || {})[it.id];
        h += say('nyugodt', U.cap(U.relDay(d.date)) + ' ' + U.toHM(it.start) + '-kor ' + esc(lower1(it.title)) + ' lenne. Mi legyen vele?',
          '<button type="button" class="chip ' + (r === 'later' ? 'dark' : 'white') + '" data-a="dRes" data-id="' + it.id + '" data-how="later">Később aznap</button>' +
          (canMove ? '<button type="button" class="chip ' + (r === 'tomorrow' ? 'dark' : 'white') + '" data-a="dRes" data-id="' + it.id + '" data-how="tomorrow">Másnapra</button>' : '') +
          '<button type="button" class="chip ' + (r === 'skip' ? 'dark' : 'white') + '" data-a="dRes" data-id="' + it.id + '" data-how="skip">Aznap kimarad</button>');
      });
    }
    h += '<button type="button" class="btn block" data-a="saveEntry">' + (isEv ? 'Mentés a naptárba' : 'Feladat mentése') + '</button>';
    if (d.editId) h += '<button type="button" class="btn-danger" style="align-self:center" data-a="delEntry">Törlés</button>';
    return h;
  };

  function radio(on, title, sub, attrs) { return '<button type="button" class="radio' + (on ? ' on' : '') + '" role="radio" aria-checked="' + on + '" ' + attrs + '><span class="radio-dot"></span><span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:15px;font-weight:600">' + title + '</span><span class="small muted">' + sub + '</span></span></button>'; }
  function daypick(sel, i) {
    return '<div class="daypick">' + U.DAYS_SHORT.map(function (n, k) { var on = sel.indexOf(k) >= 0; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-a="dDay" data-i="' + i + '" data-d="' + k + '">' + n + '</button>'; }).join('') + '</div>';
  }
  SHEETS.projForm = function (state, ui, s) {
    var d = s.draft, coll = d.kind === 'collection';
    var h = sheetHead(d.id ? 'Projekt szerkesztése' : 'Új projekt');
    h += seg([['goal', 'Célprojekt'], ['collection', 'Gyűjtő']], d.kind, function (v) { return 'data-a="d" data-k="kind" data-v="' + v + '"'; });
    if (coll) h += '<p class="help" style="margin-top:-8px">A gyűjtő egy mappa: nincs célja, ütemezése vagy kvótája, csak összefogja az ide sorolt eseményeket és feladatokat.</p>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><label for="pf-name" class="label">Név</label><input id="pf-name" class="field title" value="' + esc(d.name) + '" data-bind="name" placeholder="' + (coll ? 'pl. MomLife' : 'pl. Kínai — felkészülés az útra') + '">' +
      '<div class="label">Kategória</div>' + catChips(state, d.catId, function (id) { return 'data-a="d" data-k="catId" data-v="' + id + '"'; }, true) +
      (coll ? '<label for="pf-note" class="label">Mi kerül ide?</label><textarea id="pf-note" class="field" rows="2" placeholder="pl. iskola, orvos, szülinapok" data-bind="note">' + esc(d.note) + '</textarea>' : '') + '</div>';
    if (!coll) {
      // Cél
      h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="label">Cél</div>' + seg([['none', 'Nincs'], ['quantity', 'Mennyiség'], ['milestones', 'Mérföldkövek']], d.goalType, function (v) { return 'data-a="d" data-k="goalType" data-v="' + v + '"'; });
      if (d.goalType === 'quantity') {
        h += '<div class="row"><label for="pf-target" class="hidden-label">Célmennyiség</label><input id="pf-target" class="field num-input" style="width:120px" inputmode="decimal" value="' + esc(d.target) + '" placeholder="300" data-bind="target" data-rerender="1"><label for="pf-unit" class="hidden-label">Egység</label><input id="pf-unit" class="field" value="' + esc(d.unit) + '" placeholder="egység, pl. szó" data-bind="unit"></div>' +
          '<div class="frow"><label for="pf-start">Eddigi állás</label><input id="pf-start" class="field sm" inputmode="decimal" value="' + esc(d.start) + '" placeholder="0" data-bind="start" data-rerender="1"></div>' +
          '<p class="help">A haladás a napi számból gyűlik (lent kapcsolhatod be), ehhez adódik az eddigi állás.</p>';
      } else if (d.goalType === 'milestones') h += '<p class="help">A lépéseket a projekt feladataiként veszed fel; a haladás ezekből számolódik.</p>';
      h += '<div style="height:1px;background:var(--line)"></div><div class="frow"><div><div style="font-weight:600;font-size:15px">Határidő</div>' + (d.hasDeadline && d.deadline ? '<div class="small muted">' + U.fmtDate(d.deadline) + ' · ' + daysLeft(d.deadline) + ' nap</div>' : '') + '</div>' + sw(d.hasDeadline, 'data-a="dToggle" data-k="hasDeadline"', 'Határidő') + '</div>';
      if (d.hasDeadline) h += '<label for="pf-dl" class="hidden-label">Határidő dátuma</label><input id="pf-dl" type="date" class="field" value="' + esc(d.deadline) + '" data-bind="deadline" data-rerender="1">' +
        '<div class="frow"><div><div style="font-weight:600;font-size:15px">Visszaszámláló a Ma képernyőn</div></div>' + sw(d.countdown, 'data-a="dToggle" data-k="countdown"', 'Visszaszámláló') + '</div>';
      h += '</div>';

      // Ütemezés
      h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div><div class="label">Ütemezett tevékenységek</div><p class="help" style="margin-top:4px">Egy projekthez több is tartozhat, mindegyik a saját ritmusában.</p></div>';
      d.acts.forEach(function (a, i) {
        h += '<div class="inset"><label for="pa-t-' + i + '" class="hidden-label">Tevékenység neve</label><input id="pa-t-' + i + '" class="field" style="background:#fff;font-weight:600" value="' + esc(a.title) + '" placeholder="Tevékenység, pl. Kínai tanulás" data-bind="acts.' + i + '.title">' +
          '<div role="radiogroup" aria-label="Ütemezés" style="display:flex;flex-direction:column;gap:2px">' +
          radio(a.type === 'daily', 'Naponta', 'a kiválasztott napokon, nagyjából ugyanakkor', 'data-a="d" data-k="acts.' + i + '.type" data-v="daily"') +
          radio(a.type === 'every', 'Néhány naponta', 'pl. kétnaponta, mint a Pilates', 'data-a="d" data-k="acts.' + i + '.type" data-v="every"') +
          radio(a.type === 'quota', 'Heti kvóta', 'X alkalom a héten, az app keres neki helyet', 'data-a="d" data-k="acts.' + i + '.type" data-v="quota"') +
          radio(a.type === 'none', 'Eseti', 'nincs ritmus, csak feladatlista', 'data-a="d" data-k="acts.' + i + '.type" data-v="none"') + '</div>';
        if (a.type !== 'none') {
          if (a.type === 'every') h += '<div class="frow"><label for="pa-n-' + i + '">Hány naponta</label><input id="pa-n-' + i + '" class="field sm" style="background:#fff" inputmode="numeric" value="' + esc(a.n) + '" data-bind="acts.' + i + '.n"></div>';
          if (a.type === 'quota') h += '<div class="frow"><label for="pa-q-' + i + '">Alkalom hetente</label><input id="pa-q-' + i + '" class="field sm" style="background:#fff" inputmode="numeric" value="' + esc(a.quota) + '" data-bind="acts.' + i + '.quota"></div>';
          h += '<div class="small muted">' + (a.type === 'quota' ? 'Mely napokon lehet' : 'Mely napokon') + '</div>' + daypick(a.days, i) +
            '<div class="frow"><label for="pa-time-' + i + '">Mikor</label><input id="pa-time-' + i + '" type="time" class="field sm" style="background:#fff" value="' + esc(a.time) + '" data-bind="acts.' + i + '.time"></div>' +
            '<div class="frow"><label for="pa-dur-' + i + '">Mennyi ideig (perc)</label><input id="pa-dur-' + i + '" class="field sm" style="background:#fff" inputmode="numeric" value="' + esc(a.dur) + '" data-bind="acts.' + i + '.dur"></div>' +
            '<p class="help">Időpont nélkül az app keres neki szabad helyet.</p>' +
            '<div class="frow"><span class="flabel">Fő dolog lehet</span>' + sw(a.important, 'data-a="dToggle" data-k="acts.' + i + '.important"', 'Fő dolog') + '</div>' +
            '<div class="frow"><span class="flabel">Szokáskör a Ma képernyőn</span>' + sw(a.habit, 'data-a="dToggle" data-k="acts.' + i + '.habit"', 'Szokáskör') + '</div>';
        }
        h += '<button type="button" class="btn-danger" style="align-self:flex-start;padding:4px 0" data-a="dActDel" data-i="' + i + '">Tevékenység törlése</button></div>';
      });
      h += '<button type="button" class="btn-soft" style="align-self:flex-start" data-a="dActAdd">' + I.plus + (d.acts.length ? 'Másik tevékenység' : 'Tevékenység') + '</button></div>';

      // Napi szám
      h += '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="frow"><div><div style="font-weight:600;font-size:15px">Napi szám a Mai számok között</div><div class="small muted">Ide írod be, mennyit haladtál</div></div>' + sw(d.metricOn, 'data-a="dToggle" data-k="metricOn"', 'Napi szám') + '</div>';
      if (d.metricOn) h += '<div class="frow"><label for="pm-n">Mező neve</label><input id="pm-n" class="field" style="width:170px;text-align:center" value="' + esc(d.metricName) + '" placeholder="pl. Új szavak" data-bind="metricName"></div>' +
        '<div class="frow"><label for="pm-u">Egység</label><input id="pm-u" class="field sm" value="' + esc(d.metricUnit) + '" placeholder="szó" data-bind="metricUnit"></div>' +
        '<div class="frow"><label for="pm-t">Napi cél</label><input id="pm-t" class="field sm" inputmode="decimal" value="' + esc(d.metricTarget) + '" placeholder="–" data-bind="metricTarget"></div>';
      h += '</div>';

      // Callan számol
      var tgt = U.parseNum(d.target), st0 = U.parseNum(d.start) || 0;
      if (d.goalType === 'quantity' && tgt && d.hasDeadline && d.deadline) {
        var already = d.metricId ? Sch.metricTotal(state, d.metricId) : 0;
        var rem = tgt - st0 - already, dl = daysLeft(d.deadline);
        if (dl > 0 && rem > 0) {
          var per = rem / dl, perTxt = per < 10 ? U.num(per, 1) : U.num(Math.ceil(per));
          h += say('beszel', U.num(tgt) + ' ' + esc(d.unit || '') + ' ' + U.untilDay(d.deadline) + ': napi ' + perTxt + ' ' + esc(d.unit || '') + ' kell hozzá.' + (per <= 3 ? ' Belefér.' : ''));
        } else if (rem <= 0) h += say('buszke', 'Ezt a célt már el is érted.');
      } else if (coll) h += say('beszel', 'Itt nem számolgatok semmit, csak rendben tartom, amit ide sorolsz.');
    } else h += say('beszel', 'Itt nem számolgatok semmit, csak rendben tartom, amit ide sorolsz.');
    h += '<button type="button" class="btn block" data-a="saveProj">' + (coll ? 'Gyűjtő mentése' : 'Projekt mentése') + '</button>';
    return h;
  };

  SHEETS.proj = function (state, ui, s) {
    var p = Sch.proj(state, s.id);
    if (!p) return sheetHead('Projekt') + '<div class="card"><p class="help">Ez a projekt már nem létezik.</p></div>';
    var col = Sch.catColor(state, p.catId), c = Sch.cat(state, p.catId), t = U.today();
    var h = sheetHead(esc(p.name), '<button type="button" class="btn-link" data-a="open" data-s="projForm" data-id="' + p.id + '">Szerkesztés</button>');
    h += '<div class="row" style="gap:14px">' + chipIco(state, p.catId, p.kind === 'collection') + '<div><div class="small" style="color:' + col + ';font-weight:600">' + esc(c ? c.name : '') + '</div><div class="small muted">' + (p.kind === 'collection' ? 'Gyűjtő' : 'Célprojekt') + (p.deadline ? ' · határidő ' + U.fmtDate(p.deadline) + ' (' + daysLeft(p.deadline) + ' nap)' : '') + '</div></div></div>';
    if (p.note) h += '<p class="help" style="font-size:14px">' + esc(p.note) + '</p>';
    var tasks = state.tasks.filter(function (x) { return x.projectId === p.id; });
    if (p.goal && p.goal.type === 'quantity' && p.goal.metricId) {
      var tot = (p.goal.start || 0) + Sch.metricTotal(state, p.goal.metricId);
      h += '<div class="card" style="display:flex;flex-direction:column;gap:10px"><div class="label">Haladás</div><div class="row" style="gap:8px;align-items:baseline"><span class="big-num" style="font-size:36px;color:' + col + '">' + U.num(tot) + '</span><span class="small muted">' + (p.goal.target ? '/ ' + U.num(p.goal.target) + ' ' : '') + esc(p.goal.unit) + '</span></div>' +
        (p.goal.target ? '<div class="bar"><i style="width:' + Math.min(100, Math.round(tot / p.goal.target * 100)) + '%;background:' + col + '"></i></div>' : '') + '</div>';
    } else if (p.goal && p.goal.type === 'milestones' && tasks.length) {
      var dn = tasks.filter(function (x) { return x.done; }).length;
      h += '<div class="inset" style="background:#fff;box-shadow:var(--shadow)"><div class="between"><div><div class="label" style="color:' + col + '">Mérföldkövek</div></div><span class="serif" style="font-size:20px;color:' + col + '">' + dn + ' / ' + tasks.length + '</span></div><div class="segbar" style="grid-template-columns:repeat(' + tasks.length + ',minmax(0,1fr))">' + tasks.map(function (x) { return '<i style="background:' + (x.done ? col : '#EADCCB') + '"></i>'; }).join('') + '</div></div>';
    }
    var acts = state.activities.filter(function (a) { return a.projectId === p.id; });
    if (acts.length) {
      h += '<div class="sec"><div class="label">Ütemezés</div><div class="card pad-s list">' + acts.map(function (a) {
        var extra = a.sched.type === 'quota' ? (function () { var q = Sch.quotaStatus(state, a); return ' · e héten ' + q.done + ' / ' + q.k; })() : (a.habit ? ' · ' + Sch.streak(state, a).cur + ' ' + Sch.streak(state, a).unit + ' sorozat' : '');
        return '<div class="drow"><span class="dot" style="background:' + col + '"></span><span class="grow" style="display:flex;flex-direction:column;gap:3px"><span style="font-size:14.5px;font-weight:600">' + esc(a.title) + '</span><span class="small muted">' + Sch.describe(a) + (a.time ? ' · ' + a.time : '') + ' · ' + U.dur(a.dur) + extra + '</span></span></div>';
      }).join('') + '</div></div>';
    }
    // Feladatok
    var open = tasks.filter(function (x) { return !x.done; }), done = tasks.filter(function (x) { return x.done; });
    function taskMeta(x) {
      if (x.mode === 'due') return x.due ? 'határidő ' + U.fmtShort(x.due) + (x.est ? ' · ' + hoursTxt(x) : '') : 'nincs határideje';
      return (x.date ? U.relDay(x.date) : 'nincs napja') + (x.est ? ' · ' + U.dur(x.est) : '');
    }
    h += '<div class="sec"><div class="between"><div class="label">' + (p.goal && p.goal.type === 'milestones' ? 'Lépések' : 'Feladatok') + '</div><button type="button" class="btn-link" data-a="open" data-s="entry" data-mode="task" data-proj="' + p.id + '">+ Feladat</button></div><div class="card" style="display:flex;flex-direction:column;gap:6px">' +
      (open.length ? '' : '<p class="help">Nincs nyitott feladat.</p>') +
      open.map(function (x) {
        var bar = x.mode === 'due' && x.est ? '<div class="bar" style="margin-top:6px"><i style="width:' + Math.min(100, Math.round((x.spent || 0) / x.est * 100)) + '%;background:' + col + '"></i></div>' : '';
        return '<div class="drow" style="padding:10px 0;align-items:flex-start">' + check(false, col, 'data-a="task" data-id="' + x.id + '"', 'Kész: ' + x.title, true) + '<button type="button" class="grow" style="border:0;background:none;text-align:left;padding:2px 0 0;display:flex;flex-direction:column;gap:3px" data-a="open" data-s="entry" data-edit="task" data-id="' + x.id + '"><span style="font-size:14.5px;font-weight:500">' + esc(x.title) + '</span><span class="small muted">' + taskMeta(x) + '</span>' + bar + '</button></div>';
      }).join('') +
      (ui.showDone ? done.map(function (x) { return '<div class="drow" style="padding:10px 0">' + check(true, col, 'data-a="task" data-id="' + x.id + '"', 'Visszavonás: ' + x.title, true) + '<span class="drow-title" style="color:var(--faint);text-decoration:line-through">' + esc(x.title) + '</span></div>'; }).join('') : '') +
      (done.length ? '<button type="button" class="btn-link" style="align-self:flex-start;color:var(--muted)" data-a="toggleDone">' + (ui.showDone ? 'Kész tételek elrejtése' : 'Kész · ' + done.length) + '</button>' : '') +
      '</div></div>';
    // Események
    var evs = state.events.filter(function (e) { return e.projectId === p.id; }).sort(function (a, b) { return (a.date + (a.start || '')) < (b.date + (b.start || '')) ? -1 : 1; });
    var up = evs.filter(function (e) { return e.date >= t; }), past = evs.filter(function (e) { return e.date < t; }).reverse();
    if (evs.length || p.kind === 'collection') {
      h += '<div class="sec"><div class="between"><div class="label">Események</div><button type="button" class="btn-link" data-a="open" data-s="entry" data-proj="' + p.id + '">+ Esemény</button></div><div class="card pad-s list">' +
        (up.length ? up.map(evRow).join('') : '<div class="drow muted small">Nincs közelgő esemény.</div>') + '</div>' +
        (past.length ? '<button type="button" class="btn-link" style="align-self:flex-start;color:var(--muted)" data-a="togglePast">' + (ui.showPast ? 'Korábbiak elrejtése' : 'Korábbiak · ' + past.length) + '</button>' + (ui.showPast ? '<div class="card pad-s list">' + past.map(evRow).join('') + '</div>' : '') : '') + '</div>';
    }
    if (p.catId === 'write') {
      var ni = state.ideas.filter(function (i) { return i.projectId === p.id; }).length;
      h += '<button type="button" class="card between" style="border:0;width:100%" data-a="ideasOf" data-id="' + p.id + '"><span class="row">' + I.bulb + '<span style="font-weight:600">' + ni + ' ötlet ehhez a projekthez</span></span>' + I.right + '</button>';
    }
    h += '<div class="chips" style="justify-content:center"><button type="button" class="btn-link" style="color:var(--muted)" data-a="archiveProj" data-id="' + p.id + '">' + (p.archived ? 'Visszaállítás' : 'Archiválás') + '</button><button type="button" class="btn-danger" data-a="delProj" data-id="' + p.id + '">Törlés</button></div>';
    return h;
    function evRow(e) { return '<button type="button" class="drow" style="width:100%;border:0;background:none;text-align:left" data-a="open" data-s="entry" data-edit="event" data-id="' + e.id + '"><span class="dot" style="background:' + Sch.catColor(state, e.catId || p.catId) + '"></span><span class="drow-title">' + esc(e.title) + '</span><span class="drow-tag">' + U.fmtShort(e.date) + (e.start && !e.allDay ? ', ' + e.start : '') + '</span></button>'; }
  };

  SHEETS.idea = function (state, ui, s) {
    var d = s.draft;
    return sheetHead('Ötlet') + '<div class="card" style="display:flex;flex-direction:column;gap:12px"><label for="i-title" class="hidden-label">Cím</label><input id="i-title" class="field title" value="' + esc(d.title) + '" data-bind="title" placeholder="Cím">' +
      '<label for="i-body" class="hidden-label">Szöveg</label><textarea id="i-body" class="field" rows="8" data-bind="body">' + esc(d.body) + '</textarea>' +
      '<label for="i-proj" class="label">Projekt</label><select id="i-proj" class="field" data-bind="projectId"><option value="">Besorolatlan</option>' + writeProjects(state).map(function (p) { return '<option value="' + p.id + '"' + (p.id === d.projectId ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '<option value="__new">+ Új kategória…</option></select></div>' +
      '<button type="button" class="btn block" data-a="saveIdeaEdit">Mentés</button><button type="button" class="btn-danger" style="align-self:center" data-a="delIdea">Ötlet törlése</button>';
  };

  SHEETS.ideaCat = function (state, ui, s) {
    var d = s.draft;
    return sheetHead('Új ötlet-kategória') + '<div class="card" style="display:flex;flex-direction:column;gap:12px"><label for="ic-name" class="label">Név</label><input id="ic-name" class="field title" placeholder="pl. Novellák, Fantasy-sorozat" value="' + esc(d.name) + '" data-bind="name">' +
      '<p class="help">Az Írói munka alá kerül gyűjtőként, így a Projektekben is megtalálod, és események, feladatok is tartozhatnak hozzá.</p></div>' +
      '<button type="button" class="btn block" data-a="saveIdeaCat">Kategória mentése</button>';
  };

  SHEETS.treasure = function (state, ui, s) {
    var d = s.draft;
    var h = sheetHead(d.id ? 'Kincs' : 'Új kincs');
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><label for="t-title" class="label">Mi az?</label><input id="t-title" class="field title" value="' + esc(d.title) + '" data-bind="title" placeholder="pl. Egy várva várt regény">' +
      '<div class="chips">' + TTYPES.map(function (ty) { var on = d.type === ty[0]; return '<button type="button" class="chip ' + (on ? 'dark' : '') + '" aria-pressed="' + on + '" data-a="d" data-k="type" data-v="' + ty[0] + '">' + ty[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><label for="t-seen" class="label">Hol láttam?</label><input id="t-seen" class="field" value="' + esc(d.seen) + '" data-bind="seen" placeholder="pl. a kiadó Instagramján">' +
      '<label for="t-buy" class="label">Hol kapható?</label><input id="t-buy" class="field" value="' + esc(d.buy) + '" data-bind="buy" placeholder="pl. Libri, előrendelés">' +
      '<label for="t-link" class="label">Link</label><input id="t-link" class="field" inputmode="url" value="' + esc(d.link) + '" data-bind="link" placeholder="https://…">' +
      (d.link && /^https?:\/\//.test(d.link) ? '<a href="' + esc(d.link) + '" target="_blank" rel="noopener" class="btn-link" style="align-self:flex-start">Link megnyitása</a>' : '') + '</div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><label for="t-date" class="label">Megjelenés napja</label><input id="t-date" type="date" class="field" value="' + esc(d.date) + '" data-bind="date"><p class="help">Ha megadod, aznap a naptárban és a Ma képernyőn is szólok.</p></div>';
    if (d.id) h += '<div class="card frow"><span style="font-weight:600;font-size:15px">Megszereztem</span>' + sw(d.got, 'data-a="dToggle" data-k="got"', 'Megszereztem') + '</div>';
    h += '<button type="button" class="btn block" data-a="saveTreasure">Mentés</button>' + (d.id ? '<button type="button" class="btn-danger" style="align-self:center" data-a="delTreasure">Törlés</button>' : '');
    return h;
  };

  SHEETS.weight = function (state, ui, s) {
    var d = s.draft;
    return sheetHead('Mérés') + '<div class="card" style="display:flex;flex-direction:column;gap:14px"><div class="frow"><label for="w-date">Nap</label><input id="w-date" type="date" class="field" style="width:170px" value="' + esc(d.date) + '" data-bind="date"></div>' +
      '<div class="frow"><label for="w-val">Testsúly (kg)</label><input id="w-val" class="num-input" inputmode="decimal" value="' + esc(d.v) + '" data-bind="v" placeholder="–"></div></div>' +
      '<button type="button" class="btn block" data-a="saveWeight">Mentés</button>';
  };

  SHEETS.close = function (state, ui) {
    var t = U.today(), info = Sch.getDay(state, t), day = state.days[t] || {};
    var h = sheetHead('Esti zárás');
    h += say('almos', 'Mára elég volt. Egy perc, és lezárjuk.');
    var open = info.items.filter(function (i) { return (i.kind === 'activity' || i.kind === 'task') && !i.done; });
    var tasks = Sch.tasksFor(state, t).filter(function (x) { return !x.done && !info.items.some(function (i) { return i.refId === x.id; }); });
    if (open.length || tasks.length) {
      h += '<div class="sec"><div class="label">Ami még nyitva van</div><div class="card pad-s list">' + open.map(function (it) {
        return '<div class="drow">' + check(false, Sch.catColor(state, it.catId), 'data-a="done" data-date="' + t + '" data-id="' + it.id + '"', 'Kész: ' + it.title, true) + '<span class="drow-title">' + esc(it.title) + '</span><span class="drow-tag">' + (it.start != null ? U.toHM(it.start) : '') + '</span></div>';
      }).join('') + tasks.map(function (x) {
        return '<div class="drow">' + check(false, Sch.catColor(state, x.catId || (Sch.proj(state, x.projectId) || {}).catId), 'data-a="task" data-id="' + x.id + '"', 'Kész: ' + x.title, true) + '<span class="drow-title">' + esc(x.title) + '</span><span class="drow-tag">feladat</span></div>';
      }).join('') + '</div><p class="help">Ami nyitva marad, az ma kimaradt. A napi feladatok holnap reggel újra előkerülnek, a határidősök maradéka újraoszlik.</p></div>';
    }
    var ms = todaysMetrics(state, t, info.items);
    if (ms.length) h += '<div class="sec"><div class="label">Mai számok</div><div class="card pad-s list">' + metricRows(state, t, ms) + '</div></div>';
    h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div style="font-weight:600;font-size:15px">Betartottad a képernyő-határt (' + state.settings.screenCut + ')?</div><div class="chips"><button type="button" class="chip ' + (day.screenOk === true ? 'dark' : '') + '" data-a="screenOk" data-v="1">Igen</button><button type="button" class="chip ' + (day.screenOk === false ? 'dark' : '') + '" data-a="screenOk" data-v="0">Most nem</button></div></div>';
    var tm = U.addDays(t, 1), ti = Sch.getDay(state, tm).items.filter(function (i) { return (i.kind === 'activity' || i.kind === 'event' || i.kind === 'task') && i.start != null; }).slice(0, 10);
    h += '<div class="sec"><div class="between"><div class="label">Holnap</div><button type="button" class="btn-link" data-a="calTomorrow">Szerkesztés</button></div><div class="card pad-s list">' + (ti.length ? ti.map(function (it) {
      return '<div class="drow"><span class="drow-time">' + U.toHM(it.start) + '</span><span class="dot" style="background:' + Sch.catColor(state, it.catId) + '"></span><span class="drow-title">' + esc(it.title) + '</span></div>';
    }).join('') : '<div class="drow muted small">Holnapra nincs semmi betervezve.</div>') + '</div></div>';
    h += '<button type="button" class="btn block" data-a="closeDay">Kész a nap</button>';
    return h;
  };

  SHEETS.plan = function (state, ui) {
    var t = U.today(), next = U.addDays(U.weekStart(t), 7);
    var undated = Sch.undated(state).filter(function (x) { return x.mode !== 'due'; });
    var h = sheetHead('Heti tervezés') + say('beszel', 'Nézzük a jövő hetet. A dátum nélküli feladatokat itt osztod be egy-egy napra.');
    if (!undated.length) h += '<div class="card"><div class="empty">Nincs beosztatlan feladat. Minden a helyén van.</div></div>';
    undated.forEach(function (x) {
      var p = Sch.proj(state, x.projectId);
      h += '<div class="card" style="display:flex;flex-direction:column;gap:12px"><div class="between"><span style="font-weight:600;font-size:15px">' + esc(x.title) + '</span><span class="small muted">' + esc(p ? p.name : '') + '</span></div><div class="daypick">' +
        U.DAYS_SHORT.map(function (n, k) { var d = U.addDays(next, k); return '<button type="button" data-a="taskDate" data-id="' + x.id + '" data-d="' + d + '" aria-label="' + U.fmtLong(d) + '">' + n + '</button>'; }).join('') + '</div></div>';
    });
    var qs = state.activities.filter(function (a) { return a.sched.type === 'quota'; });
    if (qs.length) h += '<div class="sec"><div class="label">Heti kvóták a jövő héten</div><div class="card pad-s list">' + qs.map(function (a) { return '<div class="drow"><span class="drow-title">' + esc(a.title) + '</span><span class="drow-tag">' + Sch.describe(a) + '</span></div>'; }).join('') + '</div><p class="help">Ezeket az app magától osztja el a héten.</p></div>';
    return h + '<button type="button" class="btn block" data-a="close">Kész</button>';
  };
})();
