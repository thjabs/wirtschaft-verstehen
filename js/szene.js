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
    /* Lichtschalter und Wandkalender liegen bei schmalen Fenstern außerhalb des Bildes. */
    schalter.hidden = (b / s) / 2 < 485;
    var kal = document.getElementById('kalender');
    if (kal) { kal.hidden = (b / s) / 2 < 505; }
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

  /* --- Bäume zwischen den Häusern (Farbe folgt der Jahreszeit) */
  (function () {
    var fern = document.getElementById('baeume-fern');
    var nah = document.getElementById('baeume-nah');
    if (!fern || !nah) { return; }
    function baum(ziel, x, basis, h, schlank) {
      svg('rect', { 'class': 'f-stamm', x: r1(x - h * 0.05), y: r1(basis - h * 0.45), width: r1(h * 0.1), height: r1(h * 0.47) }, ziel);
      if (schlank) {
        svg('ellipse', { 'class': 'f-baum', cx: x, cy: r1(basis - h * 0.62), rx: r1(h * 0.2), ry: r1(h * 0.42) }, ziel);
      } else {
        svg('circle', { 'class': 'f-baum', cx: r1(x - h * 0.16), cy: r1(basis - h * 0.55), r: r1(h * 0.26) }, ziel);
        svg('circle', { 'class': 'f-baum', cx: r1(x + h * 0.18), cy: r1(basis - h * 0.58), r: r1(h * 0.24) }, ziel);
        svg('circle', { 'class': 'f-baum2', cx: x, cy: r1(basis - h * 0.74), r: r1(h * 0.27) }, ziel);
      }
    }
    [[452, 26, 0], [520, 22, 1], [606, 28, 0], [668, 20, 1], [742, 24, 0], [1076, 22, 1], [1104, 28, 0], [1158, 24, 0]].forEach(function (b) {
      baum(fern, b[0], 378, b[1], b[2]);
    });
    [[818, 58, 0], [846, 40, 1], [1096, 46, 0]].forEach(function (b) {
      baum(nah, b[0], 438, b[1], b[2]);
    });
  })();

  /* --- Was vor dem Fenster fällt oder schwebt: Blüten, Glühwürmchen, Laub, Schnee */
  (function () {
    var g = document.getElementById('wetter');
    if (!g) { return; }
    for (var i = 0; i < 30; i++) {
      var t = svg('g', {
        'class': 'teilchen',
        style: '--x:' + Math.round(430 + rnd() * 740) + 'px;--y:' + Math.round(300 + rnd() * 120) + 'px;--dx:' +
          Math.round(-30 + rnd() * 60) + 'px;--d:' + r1(9 + rnd() * 9) + 's;--v:-' + r1(rnd() * 18) + 's'
      }, g);
      svg('ellipse', { rx: r1(1.5 + rnd() * 1.3), ry: r1(1.5 + rnd() * 1.3) }, t);
    }
  })();

  /* --- Lichterkette: Birnen entlang des Drahts */
  (function () {
    var draht = document.getElementById('kette');
    var g = document.getElementById('birnen');
    if (!draht || !g || !draht.getTotalLength) { return; }
    var laenge = draht.getTotalLength();
    var anzahl = 15;
    for (var i = 0; i < anzahl; i++) {
      var p = draht.getPointAtLength(laenge * (i + 0.5) / anzahl);
      var b = svg('g', { 'class': 'birne', transform: 'translate(' + r1(p.x) + ' ' + r1(p.y + 5) + ')', style: '--v:-' + r1(rnd() * 4) + 's' }, g);
      svg('circle', { 'class': 'birne-hof', r: 12 }, b);
      svg('circle', { 'class': 'birne-kern', r: 4 }, b);
    }
  })();

  /* --- Jahreszeiten */
  var JAHRESZEITEN = ['fruehling', 'sommer', 'herbst', 'winter'];
  var NAMEN = { fruehling: 'Frühling', sommer: 'Sommer', herbst: 'Herbst', winter: 'Winter' };
  var jahreszeitKnopf = document.getElementById('jahreszeit-knopf');
  var kalender = document.getElementById('kalender');
  var kalName = document.getElementById('kal-name');

  function setzeJahreszeit(j, merken) {
    if (JAHRESZEITEN.indexOf(j) === -1) { j = 'herbst'; }
    wurzel.setAttribute('data-jahreszeit', j);
    var naechste = NAMEN[JAHRESZEITEN[(JAHRESZEITEN.indexOf(j) + 1) % 4]];
    if (jahreszeitKnopf) {
      jahreszeitKnopf.textContent = NAMEN[j];
      jahreszeitKnopf.setAttribute('title', 'Jahreszeit wechseln (als Nächstes: ' + naechste + ')');
    }
    if (kalName) { kalName.textContent = NAMEN[j]; }
    if (kalender) { kalender.setAttribute('aria-label', 'Wandkalender, jetzt ' + NAMEN[j] + ': zum ' + naechste + ' wechseln'); }
    if (merken) {
      try { localStorage.setItem('wv-jahreszeit', j); } catch (e) { /* ohne Speicher geht es auch */ }
    }
  }
  function wechsleJahreszeit() {
    var i = JAHRESZEITEN.indexOf(wurzel.getAttribute('data-jahreszeit'));
    setzeJahreszeit(JAHRESZEITEN[(i + 1) % 4], true);
  }
  if (jahreszeitKnopf) { jahreszeitKnopf.addEventListener('click', wechsleJahreszeit); }
  if (kalender) { kalender.addEventListener('click', wechsleJahreszeit); }
  setzeJahreszeit(wurzel.getAttribute('data-jahreszeit'), false);

  /* --- Tag und Nacht */
  function setzeThema(thema, merken) {
    var nacht = thema !== 'tag';
    wurzel.setAttribute('data-thema', nacht ? 'nacht' : 'tag');
    themaKnopf.textContent = nacht ? 'Zum Tag' : 'Zur Nacht';
    schalter.setAttribute('aria-label', 'Lichtschalter: ' + (nacht ? 'zum Tag wechseln' : 'zur Nacht wechseln'));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', nacht ? '#33293d' : '#eadfc8'); }
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
