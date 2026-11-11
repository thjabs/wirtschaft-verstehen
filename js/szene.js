/* Szene: Skalierung, Stadt und Sterne erzeugen, Tag/Nacht, Pause. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var wurzel = document.documentElement;
  var buehne = document.getElementById('buehne');
  var szene = document.getElementById('szene');
  var themaKnopf = document.getElementById('thema-knopf');
  var pauseKnopf = document.getElementById('pause-knopf');
  var schalter = document.getElementById('lichtschalter');

  /* --- Skalierung: Die Szene (1600 x 900) füllt den Bildschirm, unten verankert.
     Auf schmalen Bildschirmen wird so weit vergrößert, dass der Nachttisch gut bedienbar bleibt. */
  function skaliere() {
    var b = buehne.clientWidth, h = buehne.clientHeight;
    if (!b || !h) { return; }
    var s = Math.max(b / 1600, h / 900, Math.min(b / 385, 0.82));
    szene.style.setProperty('--s', s.toFixed(4));
    /* Der Lichtschalter liegt bei schmalen Fenstern außerhalb des Bildes. */
    schalter.hidden = (b / s) / 2 < 485;
  }
  window.addEventListener('resize', skaliere);
  buehne.addEventListener('scroll', function () { buehne.scrollLeft = 0; buehne.scrollTop = 0; });
  skaliere();

  /* --- Fester Zufall, damit die Stadt bei jedem Besuch gleich aussieht. */
  function zufall(saat) {
    var a = saat >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rnd = zufall(1848);

  function svg(name, attribute, eltern) {
    var e = document.createElementNS(NS, name);
    for (var k in attribute) { e.setAttribute(k, attribute[k]); }
    if (eltern) { eltern.appendChild(e); }
    return e;
  }
  function r1(x) { return Math.round(x * 10) / 10; }

  /* --- Sterne */
  (function () {
    var g = document.getElementById('sterne');
    if (!g) { return; }
    for (var i = 0; i < 55; i++) {
      svg('circle', {
        'class': 'stern',
        cx: r1(430 + rnd() * 740),
        cy: r1(150 + rnd() * 185),
        r: r1(0.5 + rnd() * 1.1),
        style: 'animation-duration:' + r1(3 + rnd() * 5) + 's;animation-delay:-' + r1(rnd() * 8) + 's'
      }, g);
    }
  })();

  /* --- Häuserreihen der Altstadt */
  function reihe(ziel, lichter, x0, x1, basis, o) {
    var x = x0;
    while (x < x1 - 8) {
      var b = o.bMin + rnd() * (o.bMax - o.bMin);
      var h = o.hMin + rnd() * (o.hMax - o.hMin);
      var d = o.dMin + rnd() * (o.dMax - o.dMin);
      if (x + b > x1) { b = x1 - x; }
      var oben = basis - h;

      svg('rect', { 'class': 'f-haus-' + o.art, x: r1(x), y: r1(oben), width: r1(b), height: r1(h + 2) }, ziel);

      if (rnd() < 0.6) {
        /* Giebel zur Straße */
        svg('path', { 'class': 'f-dach-' + o.art, d: 'M' + r1(x - 1) + ' ' + r1(oben) + 'L' + r1(x + b / 2) + ' ' + r1(oben - d) + 'L' + r1(x + b + 1) + ' ' + r1(oben) + 'Z' }, ziel);
      } else {
        /* Traufe zur Straße */
        var k = Math.min(5, b / 5);
        svg('path', { 'class': 'f-dach-' + o.art, d: 'M' + r1(x - 1) + ' ' + r1(oben) + 'L' + r1(x + k) + ' ' + r1(oben - d * 0.7) + 'H' + r1(x + b - k) + 'L' + r1(x + b + 1) + ' ' + r1(oben) + 'Z' }, ziel);
        if (rnd() < 0.5) {
          svg('rect', { 'class': 'f-dach-' + o.art, x: r1(x + b * 0.65), y: r1(oben - d * 0.7 - o.fh), width: r1(o.fb), height: r1(o.fh + 2) }, ziel);
        }
      }

      /* Fenster */
      var spalten = Math.max(1, Math.floor((b - o.fb) / (o.fb * 2.4)));
      var zeilen = Math.max(1, Math.floor((h - o.fh) / (o.fh * 2.1)));
      var abstandX = b / (spalten + 1);
      var abstandY = h / (zeilen + 1);
      for (var z = 1; z <= zeilen; z++) {
        for (var s = 1; s <= spalten; s++) {
          var fx = r1(x + abstandX * s - o.fb / 2);
          var fy = r1(oben + abstandY * z - o.fh / 2);
          svg('rect', { 'class': 'f-fenster', x: fx, y: fy, width: o.fb, height: o.fh }, ziel);
          var wurf = rnd();
          if (wurf < 0.34) {
            var licht = svg('rect', { 'class': 'licht', x: fx, y: fy, width: o.fb, height: o.fh }, lichter);
            if (wurf < 0.17) {
              licht.setAttribute('class', 'licht wechselt');
              licht.setAttribute('style', 'animation-duration:' + Math.round(40 + rnd() * 70) + 's;animation-delay:-' + Math.round(rnd() * 100) + 's');
            }
          }
        }
      }
      x += b + (rnd() < 0.15 ? 2 : 0);
    }
  }

  (function () {
    var fern = document.getElementById('haeuser-fern');
    var nah = document.getElementById('haeuser-nah');
    var lichterFern = document.getElementById('lichter-fern');
    var lichterNah = document.getElementById('lichter-nah');
    if (!fern || !nah) { return; }
    var oFern = { art: 'fern', bMin: 20, bMax: 34, hMin: 20, hMax: 42, dMin: 9, dMax: 17, fb: 3, fh: 4.5 };
    var oNah = { art: 'nah', bMin: 38, bMax: 62, hMin: 34, hMax: 66, dMin: 16, dMax: 28, fb: 5, fh: 7.5 };
    reihe(fern, lichterFern, 428, 762, 376, oFern);
    reihe(fern, lichterFern, 1062, 1172, 376, oFern);
    reihe(nah, lichterNah, 428, 800, 434, oNah);
    reihe(nah, lichterNah, 1118, 1172, 434, oNah);
  })();

  /* --- Tag und Nacht */
  function setzeThema(thema, merken) {
    var nacht = thema !== 'tag';
    wurzel.setAttribute('data-thema', nacht ? 'nacht' : 'tag');
    themaKnopf.textContent = nacht ? 'Zum Tag' : 'Zur Nacht';
    schalter.setAttribute('aria-label', 'Lichtschalter: ' + (nacht ? 'zum Tag wechseln' : 'zur Nacht wechseln'));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', nacht ? '#2a2640' : '#eadfc8'); }
    if (merken) {
      try { localStorage.setItem('wv-thema', nacht ? 'nacht' : 'tag'); } catch (e) { /* ohne Speicher geht es auch */ }
    }
  }
  function wechsleThema() {
    setzeThema(wurzel.getAttribute('data-thema') === 'nacht' ? 'tag' : 'nacht', true);
  }
  themaKnopf.addEventListener('click', wechsleThema);
  schalter.addEventListener('click', wechsleThema);
  setzeThema(wurzel.getAttribute('data-thema'), false);

  /* Solange nichts gespeichert ist, folgt die Seite der Systemeinstellung. */
  if (window.matchMedia) {
    var hell = window.matchMedia('(prefers-color-scheme: light)');
    var folge = function () {
      var gespeichert = null;
      try { gespeichert = localStorage.getItem('wv-thema'); } catch (e) { /* egal */ }
      if (!gespeichert) { setzeThema(hell.matches ? 'tag' : 'nacht', false); }
    };
    if (hell.addEventListener) { hell.addEventListener('change', folge); }
  }

  /* --- Pause */
  function setzeBewegung(an, merken) {
    wurzel.setAttribute('data-bewegung', an ? 'an' : 'aus');
    pauseKnopf.textContent = an ? 'Pause' : 'Weiter';
    pauseKnopf.setAttribute('title', an ? 'Animation anhalten' : 'Animation fortsetzen');
    if (merken) {
      try { localStorage.setItem('wv-bewegung', an ? 'an' : 'aus'); } catch (e) { /* egal */ }
    }
  }
  pauseKnopf.addEventListener('click', function () {
    setzeBewegung(wurzel.getAttribute('data-bewegung') === 'aus', true);
  });
  setzeBewegung(wurzel.getAttribute('data-bewegung') !== 'aus', false);

  window.WV = window.WV || {};
  window.WV.skaliere = skaliere;
})();
