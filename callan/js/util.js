/* Segédfüggvények: dátum, idő, formázás. */
(function () {
  var CA = window.CA = window.CA || {};
  function pad(n) { return String(n).padStart(2, '0'); }
  var U = CA.util = {};

  U.MONTHS = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  U.MONTHS_SHORT = ['jan.', 'febr.', 'márc.', 'ápr.', 'máj.', 'jún.', 'júl.', 'aug.', 'szept.', 'okt.', 'nov.', 'dec.'];
  U.DAYS = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];
  U.DAYS_SHORT = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  U.ymd = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  U.parse = function (s) { var p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  U.today = function () { return U.ymd(new Date()); };
  U.addDays = function (s, n) { var d = U.parse(s); d.setDate(d.getDate() + n); return U.ymd(d); };
  U.dow = function (s) { return (U.parse(s).getDay() + 6) % 7; }; // hétfő = 0
  U.weekStart = function (s) { return U.addDays(s, -U.dow(s)); };
  U.diffDays = function (a, b) { return Math.round((U.parse(b) - U.parse(a)) / 86400000); }; // b - a
  U.range = function (from, n) { var out = []; for (var i = 0; i < n; i++) out.push(U.addDays(from, i)); return out; };

  U.toMin = function (t) { if (!t) return null; var p = String(t).split(':').map(Number); return p[0] * 60 + (p[1] || 0); };
  U.toHM = function (m) { if (m == null) return ''; m = Math.max(0, Math.min(24 * 60 - 1, Math.round(m))); return Math.floor(m / 60) + ':' + pad(m % 60); };
  U.toInputTime = function (m) { if (m == null) return ''; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
  U.nowMin = function () { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

  U.uid = function () { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); };
  U.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  U.cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };

  U.fmtDate = function (s, withYear) {
    var d = U.parse(s);
    var y = (withYear || d.getFullYear() !== new Date().getFullYear()) ? d.getFullYear() + '. ' : '';
    return y + U.MONTHS[d.getMonth()] + ' ' + d.getDate() + '.';
  };
  var EN = { 1: 'jén', 2: 'án', 3: 'án', 4: 'én', 5: 'én', 6: 'án', 7: 'én', 8: 'án', 9: 'én', 10: 'én', 11: 'én', 12: 'én', 13: 'án', 14: 'én', 15: 'én', 16: 'án', 17: 'én', 18: 'án', 19: 'én', 20: 'án', 21: 'jén', 22: 'én', 23: 'án', 24: 'én', 25: 'én', 26: 'án', 27: 'én', 28: 'án', 29: 'én', 30: 'án', 31: 'én' };
  function base(s) { var d = U.parse(s); return { y: d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() + '. ' : '', m: U.MONTHS[d.getMonth()], d: d.getDate() }; }
  U.onDay = function (s) { var b = base(s); return b.y + b.m + ' ' + b.d + '-' + EN[b.d]; };      // „október 9-én”
  U.untilDay = function (s) { var b = base(s); return b.y + b.m + ' ' + b.d + (b.d === 1 ? '-jéig' : '-ig'); }; // „április 15-ig”
  U.fmtShort = function (s) { var d = U.parse(s); return U.MONTHS_SHORT[d.getMonth()] + ' ' + d.getDate() + '.'; };
  U.fmtLong = function (s) { return U.cap(U.DAYS[U.dow(s)]) + ', ' + U.fmtDate(s); };
  U.relDay = function (s) {
    var d = U.diffDays(U.today(), s);
    if (d === 0) return 'ma';
    if (d === 1) return 'holnap';
    if (d === -1) return 'tegnap';
    if (d > 1 && d < 7) return U.DAYS[U.dow(s)];
    return U.fmtShort(s);
  };

  U.num = function (n, dec) {
    if (n == null || isNaN(n)) return '–';
    return Number(n).toLocaleString('hu-HU', { maximumFractionDigits: dec == null ? 0 : dec });
  };
  U.parseNum = function (v) {
    if (v == null) return null;
    var s = String(v).replace(/\s/g, '').replace(',', '.');
    if (s === '') return null;
    var n = Number(s);
    return isNaN(n) ? null : n;
  };
  U.hexA = function (hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  };
  U.dur = function (m) {
    if (m < 60) return m + ' perc';
    var h = Math.floor(m / 60), r = m % 60;
    return r ? U.num(m / 60, 1) + ' óra' : h + ' óra';
  };
})();
