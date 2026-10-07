/* Callan – a sárkány. Duotone, síklapos SVG, hangulatokkal. */
(function () {
  var CA = window.CA = window.CA || {};
  var SKEL = "<path d=\"M60 34 L71 32 L66 37 L78 40 L70 43 L82 50 L73 51 L82 60 L74 60 L80 70 L73 69 L75 77 L72 75 C71 60 68 46 60 38 Z\" fill=\"#4E573E\"></path><path d=\"M46 28 C50 22 56 17 63 14 C59 19 56 24 54 29 Z\" fill=\"#4E573E\"></path><path d=\"M54 54 C52 62 48 72 46 85 L73 75 C72 60 68 46 60 38 L56 44 Z\" fill=\"#6F7A5A\"></path><path d=\"M57 47 C63 55 65 65 64 78 L57 80.5 C59 68 58 58 54 52 Z\" fill=\"#7E8968\"></path><path d=\"M50 52 C47 62 41 70 37 78 L37 88 L46 85 C48 72 52 62 54 54 Z\" fill=\"#B5BA9F\"></path><path d=\"M39 75 L48 70 L47 76 L37.5 81 Z\" fill=\"#C3C7AE\"></path><path d=\"M49 46 L60 37 L63 45 L55 54 L50 52.5 Z\" fill=\"#6F7A5A\"></path><path d=\"M50 30 L56 26 C66 22 74 18 81 12 C78 18 72 26 62 32 L54 35 Z\" fill=\"#9BA088\"></path><path d=\"M54 35 L62 32 C68 28 74 22 78.5 16.5 C72 22 64 27 55.5 29.5 Z\" fill=\"#7E8968\"></path><path d=\"M81 12 C79.5 15.5 77.5 18.5 75 21.5 L71.5 19.6 C75 17.2 78.3 14.8 81 12 Z\" fill=\"#C4A071\"></path><path d=\"M19 43 L24 44 L40 40 L52 37 L58 33 L62 38 L58 42 L52 47 L42 47 L24 52 L19 50 Z\" fill=\"#9BA088\"></path><path d=\"M50 42 L65 40 L55 46.5 Z\" fill=\"#B5BA9F\"></path><path d=\"M36 35 L39 27.5 L41.5 34 Z M44.5 32.5 L48 24.5 L50 31 Z\" fill=\"#C4A071\"></path><path d=\"M19 43 L21 41 L32 39 L35 35 L44 33 L40 40 L24 44 Z\" fill=\"#C3C7AE\"></path><path d=\"M44 33 L50 30 L58 33 L52 37 L40 40 Z\" fill=\"#B5BA9F\"></path><path d=\"M22.3 44.6 L25.6 43.6 L23.4 46.6 Z\" fill=\"#2E3826\"></path>";
  var MOODS = {"beszel": {"body": "<path d=\"M24 52 L42 47 L52 48 L46 51.5 L28 54 Z\" fill=\"#A76D5E\"></path><path d=\"M46 51.5 L52 48 L52.5 52 Z\" fill=\"#7E4E42\"></path><path d=\"M24 54 L28 54 L46 51.5 L52.5 52 L54 54 L44 56.5 L30 58.5 L25.5 57 Z\" fill=\"#6F7A5A\"></path><path d=\"M27 51.2 L28.6 54 L30.2 50.7 Z M34 49.6 L35.6 55 L37.4 49.1 Z M31 57.2 L32.4 53.9 L33.9 56.8 Z\" fill=\"#F6F0E4\"></path><path d=\"M36 40.2 L44.5 37.3 L42.2 41.4 Z\" fill=\"#C4A071\"></path><path d=\"M40.6 38.5 L41.2 40.9\" stroke=\"#2E3826\" stroke-width=\"1\" stroke-linecap=\"round\"></path>", "deco": []}, "nyugodt": {"body": "<path d=\"M19 50 L24 52 L42 47 L52 47.5 L54.5 51 L44 53.5 L30 56 L22.5 54.5 Z\" fill=\"#6F7A5A\"></path><path d=\"M21.5 51.4 L42 47.4 L51 47.9\" fill=\"none\" stroke=\"#3E4632\" stroke-width=\"0.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M33.2 49.2 L34.4 52.4 L35.7 48.9 Z\" fill=\"#F6F0E4\"></path><path d=\"M36 40.2 L44.5 37.3 L42.2 41.4 Z\" fill=\"#C4A071\"></path><path d=\"M40.6 38.5 L41.2 40.9\" stroke=\"#2E3826\" stroke-width=\"1\" stroke-linecap=\"round\"></path>", "deco": []}, "almos": {"body": "<path d=\"M19 50 L24 52 L42 47 L52 47.5 L54.5 51 L44 53.5 L30 56 L22.5 54.5 Z\" fill=\"#6F7A5A\"></path><path d=\"M21.5 51.4 L42 47.4 L51 47.9\" fill=\"none\" stroke=\"#3E4632\" stroke-width=\"0.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M33.2 49.2 L34.4 52.4 L35.7 48.9 Z\" fill=\"#F6F0E4\"></path><path d=\"M36.6 40 C39.2 41.8 42.2 41.2 44.4 38.6\" fill=\"none\" stroke=\"#2E3826\" stroke-width=\"1.3\" stroke-linecap=\"round\"></path>", "deco": [["z", 22, 26, 1.0], ["z", 16, 18, 1.3], ["z", 12.5, 9.5, 1.6]]}, "buszke": {"body": "<path d=\"M19 50 L24 52 L42 47 L52 47.5 L54.5 51 L44 53.5 L30 56 L22.5 54.5 Z\" fill=\"#6F7A5A\"></path><path d=\"M21.5 51.4 L42 47.4 L51 47.9\" fill=\"none\" stroke=\"#3E4632\" stroke-width=\"0.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M33.2 49.2 L34.4 52.4 L35.7 48.9 Z\" fill=\"#F6F0E4\"></path><path d=\"M36.6 41 C38.6 38.2 41.8 37.4 44.4 38.4\" fill=\"none\" stroke=\"#2E3826\" stroke-width=\"1.3\" stroke-linecap=\"round\"></path><path d=\"M30 45.6 L35 44.2 L33.6 46.6 Z\" fill=\"#A76D5E\" opacity=\"0.75\"></path>", "deco": [["s", 27, 24, 3.4], ["s", 17, 32, 2.2], ["s", 88, 26, 2.6]]}};
  function zee(x, y, s) {
    return '<path d="M' + x.toFixed(2) + ' ' + y + ' h' + (3 * s).toFixed(2) + ' l' + (-3 * s).toFixed(2) + ' ' + (3.4 * s).toFixed(2) + ' h' + (3 * s).toFixed(2) + '" fill="none" stroke="#C4A071" stroke-width="' + (1.1 * s).toFixed(2) + '" stroke-linecap="round" stroke-linejoin="round"></path>';
  }
  function spark(x, y, r) {
    var k = r * 0.28;
    function f(n) { return n.toFixed(2); }
    return '<path d="M' + f(x) + ' ' + f(y - r) + ' L' + f(x + k) + ' ' + f(y - k) + ' L' + f(x + r) + ' ' + f(y) + ' L' + f(x + k) + ' ' + f(y + k) + ' L' + f(x) + ' ' + f(y + r) + ' L' + f(x - k) + ' ' + f(y + k) + ' L' + f(x - r) + ' ' + f(y) + ' L' + f(x - k) + ' ' + f(y - k) + ' Z" fill="#C4A071"></path>';
  }
  CA.callan = {
    svg: function (mood, size, mirror, label) {
      var m = MOODS[mood] || MOODS.beszel;
      var body = SKEL + m.body;
      var deco = '';
      m.deco.forEach(function (d) {
        var kind = d[0], x = d[1], y = d[2], s = d[3];
        var X = mirror ? (100 - x - (kind === 'z' ? 3 * s : 0)) : x;
        deco += kind === 'z' ? zee(X, y, s) : spark(X, y, s);
      });
      var g = mirror ? '<g transform="translate(100 0) scale(-1 1)">' + body + '</g>' : body;
      var aria = label ? 'role="img" aria-label="' + label + '"' : 'aria-hidden="true"';
      return '<svg width="' + size + '" height="' + size + '" viewBox="7 3 86 86" ' + aria + '>' + g + deco + '</svg>';
    }
  };
})();
