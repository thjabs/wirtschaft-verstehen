/* Inhalte laden und zerlegen: Manifest, Markdown-Dateien, Glossar. */
(function () {
  'use strict';

  var WV = window.WV = window.WV || {};
  var BASIS = 'inhalte/';
  var zwischenspeicher = {};

  /* Holt eine Datei aus inhalte/ als Text (jede Datei nur einmal). */
  function hole(pfad) {
    if (!zwischenspeicher[pfad]) {
      zwischenspeicher[pfad] = fetch(BASIS + pfad).then(function (antwort) {
        if (!antwort.ok) { throw new Error(pfad + ' (' + antwort.status + ')'); }
        return antwort.text();
      });
      zwischenspeicher[pfad].catch(function () { delete zwischenspeicher[pfad]; });
    }
    return zwischenspeicher[pfad];
  }

  function ladeManifest() {
    return hole('manifest.json').then(function (text) { return JSON.parse(text); });
  }

  /* Trennt den Kopf (--- schluessel: wert ---) vom Rest. */
  function trenneKopf(roh) {
    var text = String(roh).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var kopf = {};
    var treffer = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
    if (treffer) {
      treffer[1].split('\n').forEach(function (zeile) {
        var i = zeile.indexOf(':');
        if (i > 0) { kopf[zeile.slice(0, i).trim()] = zeile.slice(i + 1).trim(); }
      });
      text = text.slice(treffer[0].length);
    }
    return { kopf: kopf, text: text };
  }

  /* Teilt Text an Überschriften einer Ebene (2 = "## ", 3 = "### ").
     Liefert [{ titel, text }]; Text vor der ersten Überschrift steht unter titel "". */
  function abschnitte(text, ebene) {
    var marke = new RegExp('^' + '#'.repeat(ebene) + '[ \\t]+(.+?)[ \\t]*$');
    var teile = [{ titel: '', zeilen: [] }];
    text.split('\n').forEach(function (zeile) {
      var treffer = marke.exec(zeile);
      if (treffer) { teile.push({ titel: treffer[1], zeilen: [] }); }
      else { teile[teile.length - 1].zeilen.push(zeile); }
    });
    return teile.map(function (t) { return { titel: t.titel, text: t.zeilen.join('\n').trim() }; });
  }

  /* Zerlegt eine Fragedatei in Kernsatz, Antwort und Quellen je Schule sowie den Konflikt. */
  function parseFrage(roh, schulen) {
    var datei = trenneKopf(roh);
    var frage = { kopf: datei.kopf, schulen: {}, konflikt: '' };
    abschnitte(datei.text, 2).forEach(function (teil) {
      var name = teil.titel.toLowerCase();
      var schule = schulen.filter(function (s) { return s.name.toLowerCase() === name; })[0];
      if (schule) {
        var unter = {};
        abschnitte(teil.text, 3).forEach(function (u) { unter[u.titel.toLowerCase()] = u.text; });
        frage.schulen[schule.id] = {
          kernsatz: unter.kernsatz || '',
          antwort: unter.antwort || '',
          quellen: unter.quellen || ''
        };
      } else if (name.indexOf('wo sie sich widersprechen') === 0) {
        frage.konflikt = teil.text;
      }
    });
    return frage;
  }

  function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Markdown zu HTML. Glossarbegriffe: [[Begriff]] oder [[Begriff|Anzeigetext]]. */
  function md(text) {
    var html = window.marked.parse(String(text || ''), { gfm: true, breaks: false });
    return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, begriff, anzeige) {
      var b = begriff.trim();
      /* span statt button, damit der Begriff im Fließtext normal umbricht */
      return '<span class="begriff" role="button" tabindex="0" data-begriff="' + escAttr(b) + '">' +
        (anzeige || b).trim() + '</span>';
    });
  }

  /* Entfernt Markdown-Auszeichnung für kurze Klartexte (Tooltip). */
  function klartext(text) {
    return String(text || '')
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function slug(text) {
    return String(text).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /* Glossar: Überschrift Ebene 2 = Begriff, erster Absatz = Kurzerklärung, Rest = ausführlich. */
  var glossarVersprechen = null;
  function ladeGlossar() {
    if (!glossarVersprechen) {
      glossarVersprechen = hole('glossar.md').then(function (roh) {
        var liste = abschnitte(trenneKopf(roh).text, 2)
          .filter(function (a) { return a.titel; })
          .map(function (a) {
            var absaetze = a.text.split(/\n[ \t]*\n/);
            return {
              begriff: a.titel,
              slug: slug(a.titel),
              kurz: (absaetze[0] || '').trim(),
              lang: absaetze.slice(1).join('\n\n').trim()
            };
          });
        liste.sort(function (a, b) { return a.begriff.localeCompare(b.begriff, 'de'); });
        var nach = {};
        liste.forEach(function (e) { nach[e.begriff.toLowerCase()] = e; });
        return { liste: liste, nach: nach };
      });
      glossarVersprechen.catch(function () { glossarVersprechen = null; });
    }
    return glossarVersprechen;
  }

  WV.hole = hole;
  WV.ladeManifest = ladeManifest;
  WV.trenneKopf = trenneKopf;
  WV.abschnitte = abschnitte;
  WV.parseFrage = parseFrage;
  WV.md = md;
  WV.klartext = klartext;
  WV.slug = slug;
  WV.ladeGlossar = ladeGlossar;
})();
