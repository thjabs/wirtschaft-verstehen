/* App: Nachttisch, Schubladenfach, Leseebene, Deep-Links, Glossar-Tooltips. */
(function () {
  'use strict';

  var WV = window.WV;
  var SEITE = 'Wirtschaft verstehen';
  var FOLGT = '<p class="folgt">Dieser Text ist noch nicht geschrieben.</p>';

  var wurzel = document.documentElement;
  var korpus = document.getElementById('nt-korpus');
  var buehne = document.getElementById('buehne');
  var fach = document.getElementById('fach');
  var fachTitel = document.getElementById('fach-titel');
  var fachEtikett = document.getElementById('fach-etikett');
  var fachZu = document.getElementById('fach-zu');
  var kartenListe = document.getElementById('karten');
  var lesen = document.getElementById('lesen');
  var lesenRahmen = document.getElementById('lesen-rahmen');
  var lesenZu = document.getElementById('lesen-zu');
  var blattOrt = document.getElementById('blatt-ort');
  var tipp = document.getElementById('tipp');

  var manifest = null;
  var glossar = null;
  var offenesFach = null;      /* id der aufgezogenen Nachttisch-Schublade */
  var fachTimer = null;
  var aktuelleRoute = '';
  var lauf = 0;                /* schützt vor überholten Ladevorgängen */
  var merker = {};             /* Route -> Liste offener Schubladen auf dem Papier */
  var aktualisiereAlle = null;

  function el(name, klasse, text) {
    var e = document.createElement(name);
    if (klasse) { e.className = klasse; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  /* --- Nachschlagen im Manifest ---------------------------------------------- */

  function alleKarten() {
    var liste = [];
    manifest.schubladen.forEach(function (s) {
      s.karten.forEach(function (k) { k.schublade = s; liste.push(k); });
    });
    return liste;
  }
  function alleFragen() { return alleKarten().filter(function (k) { return k.typ === 'frage'; }); }
  function findeKarte(id) { return alleKarten().filter(function (k) { return k.id === id; })[0] || null; }
  function findeSchublade(id) { return manifest.schubladen.filter(function (s) { return s.id === id; })[0] || null; }
  function schulName(id) {
    var s = manifest.schulen.filter(function (x) { return x.id === id; })[0];
    return s ? s.name : id;
  }
  function schubladenName(s) { return (s.nummer ? s.nummer + '. ' : '') + s.titel; }

  /* --- Navigation über den Hash ---------------------------------------------- */

  function geheZu(ziel) {
    if (ziel) {
      if (location.hash === '#' + ziel) { route(); } else { location.hash = ziel; }
    } else {
      history.pushState(null, '', location.pathname + location.search);
      route();
    }
  }

  function elternRoute() {
    var karte = findeKarte(aktuelleRoute);
    return karte ? 'schublade-' + karte.schublade.id : '';
  }

  function route() {
    var h = '';
    try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { h = location.hash.slice(1); }
    var karte;
    versteckeTipp();

    if (h === 'inhalt') {
      zeigeBlatt(h, baueInhalt);
      document.title = 'Inhaltsverzeichnis · ' + SEITE;
    } else if (h === 'glossar' || h.indexOf('glossar-') === 0) {
      zeigeBlatt(h, function (blatt) { return baueGlossar(blatt, h.slice(8)); });
      document.title = 'Glossar · ' + SEITE;
    } else if (h.indexOf('schublade-') === 0 && findeSchublade(h.slice(10))) {
      schliesseBlatt();
      setzeFach(h.slice(10), true);
      document.title = schubladenName(findeSchublade(h.slice(10))) + ' · ' + SEITE;
    } else if ((karte = findeKarte(h))) {
      setzeFach(karte.schublade.id, false);
      zeigeBlatt(h, function (blatt) { return baueKarte(karte, blatt); });
      document.title = karte.titel + ' · ' + SEITE;
    } else {
      schliesseBlatt();
      setzeFach(null, false);
      document.title = SEITE;
    }
  }

  /* --- Nachttisch und Schubladenfach ----------------------------------------- */

  function baueNachttisch() {
    manifest.schubladen.forEach(function (s) {
      var b = el('button', 'schub');
      b.type = 'button';
      b.id = 'schub-' + s.id;
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-controls', 'fach');
      b.appendChild(el('span', 'vh', 'Schublade '));
      var etikett = el('span', 'etikett');
      if (s.nummer) { etikett.appendChild(el('span', 'etikett-nr', s.nummer)); }
      etikett.appendChild(document.createTextNode((s.nummer ? ' ' : '') + s.etikett));
      b.appendChild(etikett);
      var griff = el('span', 'griff');
      griff.setAttribute('aria-hidden', 'true');
      b.appendChild(griff);
      b.addEventListener('click', function () {
        geheZu(offenesFach === s.id ? '' : 'schublade-' + s.id);
      });
      korpus.appendChild(b);
    });
  }

  function fuelleFach(s) {
    fachTitel.textContent = schubladenName(s);
    fachEtikett.textContent = '';
    if (s.nummer) { fachEtikett.appendChild(el('span', 'etikett-nr', s.nummer)); }
    fachEtikett.appendChild(document.createTextNode((s.nummer ? ' ' : '') + s.etikett));
    kartenListe.textContent = '';
    var fragen = alleFragen();
    s.karten.forEach(function (k) {
      var li = el('li');
      var a = el('a', 'karte');
      a.href = '#' + k.id;
      var reiter = 'Übersicht';
      if (k.typ === 'frage') { reiter = 'Frage ' + (fragen.indexOf(k) + 1); }
      if (k.typ === 'schule') { reiter = 'Denkschule'; a.setAttribute('data-schule', k.schule); }
      a.appendChild(el('span', 'karte-reiter', reiter));
      a.appendChild(el('span', 'karte-titel', k.titel));
      if (k.beschreibung) { a.appendChild(el('span', 'karte-text', k.beschreibung)); }
      li.appendChild(a);
      kartenListe.appendChild(li);
    });
  }

  function setzeFach(id, fokus) {
    var s = id ? findeSchublade(id) : null;
    var vorher = offenesFach;
    offenesFach = s ? s.id : null;

    [].forEach.call(korpus.querySelectorAll('.schub'), function (b) {
      b.setAttribute('aria-expanded', String(b.id === 'schub-' + offenesFach));
    });

    clearTimeout(fachTimer);
    if (s) {
      if (vorher !== s.id || !kartenListe.firstChild) { fuelleFach(s); }
      fach.hidden = false;
      void fach.offsetWidth;            /* damit die Herausfahr-Animation startet */
      fach.classList.add('offen');
      if (fokus) {
        fachTimer = setTimeout(function () {
          if (offenesFach === s.id && !lesen.open) { fachTitel.focus({ preventScroll: true }); }
        }, 60);
      }
    } else {
      var hatteFokus = fach.contains(document.activeElement);
      fach.classList.remove('offen');
      fachTimer = setTimeout(function () { fach.hidden = true; }, 480);
      if (hatteFokus && vorher) {
        var knopf = document.getElementById('schub-' + vorher);
        if (knopf) { knopf.focus({ preventScroll: true }); }
      }
    }
  }

  /* --- Leseebene --------------------------------------------------------------- */

  function zeigeBlatt(id, bauer) {
    aktuelleRoute = id;
    var meinLauf = ++lauf;
    var blatt = el('article', 'blatt');
    blattOrt.textContent = '';
    blattOrt.appendChild(blatt);
    aktualisiereAlle = null;

    if (!lesen.open) {
      lesen.showModal();
      wurzel.classList.add('liest');
    }
    lesen.scrollTop = 0;

    var fertig;
    try { fertig = Promise.resolve(bauer(blatt)); } catch (e) { fertig = Promise.reject(e); }
    fertig.then(function (ziel) {
      if (meinLauf !== lauf) { return; }
      /* gemerkte offene Schubladen wiederherstellen */
      (merker[id] || []).forEach(function (ladeId) {
        var sec = blatt.querySelector('.lade[data-lade="' + ladeId + '"]');
        if (sec) { setzeLade(sec, true); }
      });
      if (aktualisiereAlle) { aktualisiereAlle(); }
      if (ziel && ziel.scrollIntoView) {
        ziel.scrollIntoView({ block: 'start' });
        ziel.focus({ preventScroll: true });
      }
    }).catch(function (fehler) {
      if (meinLauf !== lauf) { return; }
      var p = el('p', 'folgt', 'Der Inhalt konnte nicht geladen werden (' + (fehler && fehler.message ? fehler.message : 'unbekannter Fehler') + ').');
      blatt.appendChild(p);
    });

    var titel = blatt.querySelector('.blatt-titel');
    if (titel) { titel.focus({ preventScroll: true }); }
  }

  function schliesseBlatt() {
    aktuelleRoute = '';
    lauf++;
    if (lesen.open) { lesen.close(); }
  }

  function kopf(blatt, ort, titel) {
    var k = el('header', 'blatt-kopf');
    if (ort) { k.appendChild(el('p', 'blatt-ort', ort)); }
    var h = el('h1', 'blatt-titel', titel);
    h.id = 'blatt-titel';
    h.tabIndex = -1;
    k.appendChild(h);
    blatt.appendChild(k);
  }

  /* Bilder mit Titel werden zu Abbildungen mit Bildunterschrift, externe Links öffnen neu. */
  function veredle(bereich) {
    [].forEach.call(bereich.querySelectorAll('img'), function (bild) {
      var absatz = bild.parentNode;
      if (!absatz || absatz.tagName !== 'P' || absatz.children.length !== 1) { return; }
      var figur = el('figure');
      /* bewusst ohne loading="lazy": Die Bilder sind winzig und sollen in aufgeklappten Schubladen sofort da sein */
      figur.appendChild(bild);
      if (bild.title) {
        figur.appendChild(el('figcaption', null, bild.title));
        bild.removeAttribute('title');
      }
      absatz.parentNode.replaceChild(figur, absatz);
    });
    [].forEach.call(bereich.querySelectorAll('a[href^="http"]'), function (a) {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    return bereich;
  }

  function prosa(markdown, klasse) {
    var d = el('div', 'prosa' + (klasse ? ' ' + klasse : ''));
    d.innerHTML = markdown ? WV.md(markdown) : FOLGT;
    return veredle(d);
  }

  /* --- Schubladen auf dem Papier ---------------------------------------------- */

  function baueLade(o) {
    var sec = el('section', 'lade' + (o.klein ? ' lade-klein' : ''));
    sec.setAttribute('data-lade', o.id);
    if (o.schule) { sec.setAttribute('data-schule', o.schule); }
    var h = el('h' + (o.ebene || 2), 'lade-kopf');
    var b = el('button', 'lade-griff');
    var inhaltId = 'lade-' + o.id + '-inhalt';
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', inhaltId);
    var t = el('span', 'lade-titel');
    if (o.vorsatz) { t.appendChild(el('span', 'lade-schule', o.vorsatz)); }
    t.appendChild(el('span', 'lade-art', o.titel));
    b.appendChild(t);
    var leiste = el('span', 'lade-leiste');
    leiste.setAttribute('aria-hidden', 'true');
    b.appendChild(leiste);
    h.appendChild(b);
    sec.appendChild(h);
    var inhalt = el('div', 'lade-inhalt');
    inhalt.id = inhaltId;
    inhalt.hidden = true;
    [].concat(o.inhalt).forEach(function (n) { if (n) { inhalt.appendChild(n); } });
    sec.appendChild(inhalt);
    b.addEventListener('click', function () {
      setzeLade(sec, b.getAttribute('aria-expanded') !== 'true');
      merke();
      if (aktualisiereAlle) { aktualisiereAlle(); }
    });
    return sec;
  }

  function setzeLade(sec, auf) {
    sec.firstChild.firstChild.setAttribute('aria-expanded', String(!!auf));
    sec.lastChild.hidden = !auf;
    sec.classList.toggle('offen', !!auf);
  }

  function merke() {
    if (!aktuelleRoute) { return; }
    merker[aktuelleRoute] = [].map.call(blattOrt.querySelectorAll('.lade.offen'), function (s) {
      return s.getAttribute('data-lade');
    });
  }

  /* Knopf "Alle aufziehen / alle schließen" für einen Bereich. */
  function werkzeug(bereich) {
    var w = el('div', 'blatt-werkzeug');
    var b = el('button', 'alle-knopf', 'Alle aufziehen');
    b.type = 'button';
    function laden() { return [].slice.call(bereich.querySelectorAll('.lade')); }
    function allesOffen() {
      var l = laden();
      return l.length > 0 && l.every(function (s) { return s.classList.contains('offen'); });
    }
    aktualisiereAlle = function () { b.textContent = allesOffen() ? 'Alle schließen' : 'Alle aufziehen'; };
    b.addEventListener('click', function () {
      var ziel = !allesOffen();
      laden().forEach(function (s) { setzeLade(s, ziel); });
      aktualisiereAlle();
      merke();
    });
    w.appendChild(b);
    return w;
  }

  function blaettern(karte) {
    var liste = alleKarten();
    var i = liste.indexOf(karte);
    var nav = el('nav', 'blaettern');
    nav.setAttribute('aria-label', 'Blättern');
    function verweis(k, klasse, richtung) {
      var a = el('a', klasse);
      a.href = '#' + k.id;
      a.appendChild(el('span', 'blaettern-richtung', richtung));
      a.appendChild(el('span', 'blaettern-titel', k.titel));
      nav.appendChild(a);
    }
    if (i > 0) { verweis(liste[i - 1], 'zurueck', '← Zurück'); }
    if (i < liste.length - 1) { verweis(liste[i + 1], 'vor', 'Weiter →'); }
    return nav;
  }

  /* --- Ansichten ------------------------------------------------------------------ */

  function baueKarte(karte, blatt) {
    if (karte.typ === 'frage') { return baueFrage(karte, blatt); }
    if (karte.typ === 'schule') { return baueSchule(karte, blatt); }
    return baueText(karte, blatt);
  }

  function baueFrage(karte, blatt) {
    var fragen = alleFragen();
    kopf(blatt, schubladenName(karte.schublade) + ' · Frage ' + (fragen.indexOf(karte) + 1) + ' von ' + fragen.length, karte.titel);

    return Promise.all([WV.hole(karte.datei), holeGlossar()]).then(function (r) {
      var frage = WV.parseFrage(r[0], manifest.schulen);

      var kern = el('section', 'kernsaetze');
      kern.setAttribute('aria-label', 'Die drei Kernsätze im Vergleich');
      manifest.schulen.forEach(function (s) {
        var daten = frage.schulen[s.id] || {};
        var k = el('div', 'kernsatz');
        k.setAttribute('data-schule', s.id);
        k.appendChild(el('h2', 'kernsatz-schule', s.name));
        var text = el('div', 'kernsatz-text');
        text.innerHTML = daten.kernsatz ? WV.md(daten.kernsatz) : FOLGT;
        k.appendChild(text);
        kern.appendChild(k);
      });
      blatt.appendChild(kern);

      var laden = el('div', 'laden');
      blatt.appendChild(werkzeug(laden));
      manifest.schulen.forEach(function (s) {
        var daten = frage.schulen[s.id] || {};
        var quellen = baueLade({
          id: s.id + '-quellen', titel: 'Quellen', ebene: 3, klein: true, schule: s.id,
          inhalt: prosa(daten.quellen, 'quellen')
        });
        laden.appendChild(baueLade({
          id: s.id, schule: s.id, vorsatz: s.name, titel: 'Ausführliche Antwort', ebene: 2,
          inhalt: [prosa(daten.antwort), quellen]
        }));
      });
      laden.appendChild(baueLade({
        id: 'konflikt', titel: 'Wo sie sich widersprechen', ebene: 2,
        inhalt: prosa(frage.konflikt)
      }));
      blatt.appendChild(laden);
      blatt.appendChild(blaettern(karte));
    });
  }

  function baueSchule(karte, blatt) {
    kopf(blatt, schubladenName(karte.schublade), karte.titel);
    if (karte.beschreibung) { blatt.appendChild(el('p', 'blatt-vorspann', karte.beschreibung)); }

    var auftraege = karte.teile.map(function (teil) {
      return WV.hole(teil.datei).then(function (roh) { return WV.trenneKopf(roh).text.trim(); }, function () { return ''; });
    });
    return Promise.all([Promise.all(auftraege), holeGlossar()]).then(function (r) {
      var laden = el('div', 'laden');
      blatt.appendChild(werkzeug(laden));
      karte.teile.forEach(function (teil, i) {
        laden.appendChild(baueLade({
          id: teil.id, schule: karte.schule, titel: teil.titel, ebene: 2,
          inhalt: prosa(r[0][i])
        }));
      });
      blatt.appendChild(laden);
      blatt.appendChild(blaettern(karte));
    });
  }

  function baueText(karte, blatt) {
    kopf(blatt, schubladenName(karte.schublade), karte.titel);
    return Promise.all([WV.hole(karte.datei), holeGlossar()]).then(function (r) {
      var datei = WV.trenneKopf(r[0]);
      var teile = WV.abschnitte(datei.text, 2);
      teile.forEach(function (teil) {
        if (!teil.titel) {
          if (teil.text) { blatt.appendChild(prosa(teil.text, 'blatt-vorspann')); }
          return;
        }
        var d = prosa(teil.text);
        var h = el('h2', null, teil.titel);
        d.insertBefore(h, d.firstChild);
        blatt.appendChild(d);
      });
      blatt.appendChild(blaettern(karte));
    });
  }

  function baueInhalt(blatt) {
    kopf(blatt, 'Alle Schubladen auf einen Blick', 'Inhaltsverzeichnis');
    var v = el('div', 'verzeichnis');
    var fragen = alleFragen();
    manifest.schubladen.forEach(function (s) {
      v.appendChild(el('h2', null, schubladenName(s)));
      var liste = el('ol');
      s.karten.forEach(function (k) {
        var li = el('li');
        var a = el('a');
        a.href = '#' + k.id;
        a.appendChild(el('span', 'vz-nr', k.typ === 'frage' ? String(fragen.indexOf(k) + 1) + '.' : '·'));
        a.appendChild(el('span', 'vz-titel', k.titel));
        li.appendChild(a);
        liste.appendChild(li);
      });
      v.appendChild(liste);
    });
    v.appendChild(el('h2', null, 'Nachschlagen'));
    var ul = el('ul');
    var li = el('li');
    var a = el('a');
    a.href = '#glossar';
    a.appendChild(el('span', 'vz-nr', '·'));
    a.appendChild(el('span', 'vz-titel', 'Glossar der Fachbegriffe'));
    li.appendChild(a);
    ul.appendChild(li);
    v.appendChild(ul);
    blatt.appendChild(v);
  }

  function baueGlossar(blatt, zielSlug) {
    kopf(blatt, 'Nachschlagen', 'Glossar');
    return holeGlossar().then(function (g) {
      if (!g) { throw new Error('glossar.md'); }
      blatt.appendChild(el('p', 'blatt-vorspann', 'Fachbegriffe kurz erklärt. Wo die Schulen einen Begriff verschieden verstehen, stehen die Bedeutungen nebeneinander.'));

      var feld = el('input', 'glossar-filter');
      feld.type = 'search';
      feld.placeholder = 'Begriff suchen';
      feld.setAttribute('aria-label', 'Glossar durchsuchen');
      blatt.appendChild(feld);

      var dl = el('dl', 'glossar');
      var ziel = null;
      g.liste.forEach(function (e) {
        var dt = el('dt', null, e.begriff);
        dt.id = 'glossar-' + e.slug;
        dt.tabIndex = -1;
        var dd = prosa(e.kurz + (e.lang ? '\n\n' + e.lang : ''));
        var neu = el('dd', dd.className);
        while (dd.firstChild) { neu.appendChild(dd.firstChild); }
        dl.appendChild(dt);
        dl.appendChild(neu);
        if (zielSlug && e.slug === zielSlug) { ziel = dt; dt.classList.add('ziel'); }
      });
      blatt.appendChild(dl);

      feld.addEventListener('input', function () {
        var q = feld.value.trim().toLowerCase();
        [].forEach.call(dl.querySelectorAll('dt'), function (dt) {
          var passt = !q || (dt.textContent + ' ' + dt.nextElementSibling.textContent).toLowerCase().indexOf(q) !== -1;
          dt.hidden = !passt;
          dt.nextElementSibling.hidden = !passt;
        });
      });
      return ziel;
    });
  }

  /* --- Glossar und Tooltips ------------------------------------------------------- */

  function holeGlossar() {
    return WV.ladeGlossar().then(function (g) { glossar = g; return g; }, function () { return null; });
  }

  var tippAnker = null;
  var tippFest = false;
  var tippTimer = null;

  function zeigeTipp(anker, fest) {
    clearTimeout(tippTimer);
    if (tippAnker && tippAnker !== anker) { tippAnker.removeAttribute('aria-describedby'); }
    var name = anker.getAttribute('data-begriff') || anker.textContent;
    var eintrag = glossar && glossar.nach[name.toLowerCase()];
    tipp.textContent = '';
    tipp.appendChild(el('strong', 'tipp-begriff', eintrag ? eintrag.begriff : name));
    tipp.appendChild(el('span', 'tipp-text', eintrag ? WV.klartext(eintrag.kurz) : 'Dieser Begriff steht noch nicht im Glossar.'));
    if (eintrag) {
      var a = el('a', 'tipp-link', 'Im Glossar ansehen');
      a.href = '#glossar-' + eintrag.slug;
      tipp.appendChild(a);
    }
    tipp.hidden = false;
    tippAnker = anker;
    tippFest = !!fest;
    anker.setAttribute('aria-describedby', 'tipp');

    var r = anker.getBoundingClientRect();
    var t = tipp.getBoundingClientRect();
    var x = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8);
    var y = r.bottom + 8;
    if (y + t.height > window.innerHeight - 8) { y = Math.max(8, r.top - t.height - 8); }
    tipp.style.left = Math.round(x) + 'px';
    tipp.style.top = Math.round(y) + 'px';
  }

  function versteckeTipp() {
    clearTimeout(tippTimer);
    if (tippAnker) { tippAnker.removeAttribute('aria-describedby'); }
    tippAnker = null;
    tippFest = false;
    tipp.hidden = true;
  }

  function versteckeTippBald() {
    clearTimeout(tippTimer);
    if (tippFest) { return; }
    tippTimer = setTimeout(function () { if (!tippFest) { versteckeTipp(); } }, 220);
  }

  function begriffVon(ziel) {
    return ziel && ziel.closest ? ziel.closest('.begriff') : null;
  }

  /* --- Verdrahtung ---------------------------------------------------------------- */

  function verdrahte() {
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', function () { if (!location.hash) { route(); } });

    fachZu.addEventListener('click', function () { geheZu(''); });
    buehne.addEventListener('click', function (e) {
      if (offenesFach && !e.target.closest('.nachttisch') && !e.target.closest('.lichtschalter')) { geheZu(''); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && offenesFach && !lesen.open) { geheZu(''); }
    });

    /* Leseebene schließen: Knopf, Escape, Klick neben das Papier */
    lesenZu.addEventListener('click', function () { geheZu(elternRoute()); });
    lesen.addEventListener('cancel', function (e) {
      e.preventDefault();
      if (!tipp.hidden) { versteckeTipp(); return; }
      geheZu(elternRoute());
    });
    lesen.addEventListener('close', function () {
      wurzel.classList.remove('liest');
      versteckeTipp();
    });
    var druckZiel = null;
    lesen.addEventListener('mousedown', function (e) { druckZiel = e.target; });
    lesen.addEventListener('click', function (e) {
      var daneben = function (z) { return z === lesen || z === lesenRahmen || z === blattOrt; };
      if (daneben(e.target) && daneben(druckZiel)) { geheZu(elternRoute()); return; }
      var anker = begriffVon(e.target);
      if (anker) {
        if (tippFest && tippAnker === anker) { versteckeTipp(); } else { zeigeTipp(anker, true); }
      } else if (!tipp.contains(e.target)) {
        versteckeTipp();
      }
    });

    lesen.addEventListener('keydown', function (e) {
      var anker = begriffVon(e.target);
      if (anker && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (tippFest && tippAnker === anker) { versteckeTipp(); } else { zeigeTipp(anker, true); }
      }
    });

    lesen.addEventListener('mouseover', function (e) {
      var anker = begriffVon(e.target);
      if (anker) { if (!(tippFest && tippAnker === anker)) { zeigeTipp(anker, tippFest && tippAnker === anker); } }
      else if (tipp.contains(e.target)) { clearTimeout(tippTimer); }
    });
    lesen.addEventListener('mouseout', function (e) {
      if (begriffVon(e.target) || tipp.contains(e.target)) { versteckeTippBald(); }
    });
    lesen.addEventListener('focusin', function (e) {
      var anker = begriffVon(e.target);
      if (anker && tippAnker !== anker) { zeigeTipp(anker, false); }
    });
    lesen.addEventListener('focusout', function (e) {
      if (begriffVon(e.target) && !tipp.contains(e.relatedTarget)) { versteckeTippBald(); }
    });
    lesen.addEventListener('scroll', function () { if (!tipp.hidden) { versteckeTipp(); } }, { passive: true });
  }

  /* --- Start ---------------------------------------------------------------------- */

  WV.ladeManifest().then(function (m) {
    manifest = m;
    baueNachttisch();
    verdrahte();
    route();
  }).catch(function (fehler) {
    var p = el('p', 'ohne-js', 'Die Inhalte konnten nicht geladen werden. Läuft die Seite über einen Webserver (tools/serve.ps1 oder GitHub Pages)? Fehler: ' + (fehler && fehler.message ? fehler.message : fehler));
    document.body.appendChild(p);
  });
})();
