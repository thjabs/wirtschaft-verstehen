# PROGRESS

Stand: 11.11.2026, Ende Sitzung 4. Alle Inhalte aus dem Sitzungsplan sind geschrieben. Bei „mach weiter“ geht es beim ersten offenen Punkt weiter.

## Sitzung 1 – Fundament

- [x] Git-Repo (lokal, Zweig `main`), Dateistruktur, `README.md`, `PROGRESS.md`, `REVIEW.md`
- [x] Inhalts-Pipeline: Manifest, Markdown laden und parsen, Schubladen-Komponenten, Deep-Links, Inhaltsverzeichnis, Glossar-Tooltips
- [x] Nachtszene in Grundform: Zimmer, Nachttisch mit 5 Schubladen, Fenster mit Stadt, Tag/Nacht-Schalter, Pause-Knopf, Leseebene
- [x] Wortzahl-Skript (`tools/wortzahl.ps1`) und Vorschau-Server (`tools/serve.ps1`)
- [x] Alle Kernsätze für alle 12 Fragen (36 Stück)
- [x] Vorgezogen: Glossar-Grundstock mit 17 Begriffen (nur die, die in den Kernsätzen vorkommen)
- [x] GitHub-Repo `thjabs/wirtschaft-verstehen` angelegt, GitHub Pages eingeschaltet (`main`, `/`), `.nojekyll` liegt im Wurzelordner. Live: https://thjabs.github.io/wirtschaft-verstehen/
- [x] Entscheidung: `CLAUDE.md` bleibt nur lokal (steht in `.gitignore`), weil sie lokale Pfade enthält

## Sitzung 2 – Grundlagen

- [x] Neoklassik: Entstehung (513 Wörter), Aktueller Stand (291), Debatten (314), Strömungen (207)
- [x] Postkeynesianismus: Entstehung (480), Aktueller Stand (285), Debatten (307), Strömungen (195)
- [x] Marxismus: Entstehung (510), Aktueller Stand (293), Debatten (335), Strömungen (206)
- [x] „Weitere Theorien“: sieben Steckbriefe (74 bis 87 Wörter) mit Verweis auf Exploring Economics
- [x] Zusätzlich je Schule eine Schublade „Zum Weiterlesen“ mit geprüften Titeln (`literatur.md`)
- [x] Glossar auf 31 Begriffe ausgebaut, umstritten markiert: Kapital, Wert, Geld, Gleichgewicht
- [ ] Glossar gegen ein Lehrbuch abgleichen (steht in `REVIEW.md`)

## Sitzung 3 – Problemfelder I und II

- [x] Frage 1: Antworten, Quellen, Konflikt, Modellbild (externer Effekt)
- [x] Frage 2 (Modellbild: Zusatzlast einer Steuer)
- [x] Frage 3 (Modellbild: Sektorensalden, schematisch)
- [x] Frage 4 (Modellbild: Arbeitstag und Mehrwert)
- [x] Frage 5 (Modellbild: G–W–G′)
- [x] Frage 6 (Modellbild: Arbeitsmarkt mit Mindestlohn)

## Sitzung 4 – Problemfelder III und IV

- [x] Frage 7 (Modellbild: Lohnstückkosten in der Währungsunion, schematisch)
- [x] Frage 8 (Modellbild: Ricardos Zahlenbeispiel)
- [x] Frage 9 (Modellbild: Zentrum und Peripherie)
- [x] Frage 10 (Modellbild: externer Effekt, wie Frage 1)
- [x] Frage 11 (Modellbild: Minskys drei Finanzierungsformen)
- [x] Frage 12 (ohne Modellbild)

## Zum Schluss jeder Sitzung

- [ ] Wortzahl-Skript laufen lassen
- [ ] Seite lokal durchklicken (Desktop- und Mobilbreite, Tag und Nacht)
- [ ] `REVIEW.md` und `PROGRESS.md` aktualisieren, committen
- [ ] Kurzbericht in 3–5 Sätzen

## Geprüft in Sitzung 1

- Wortzahl-Skript: 156 Abschnitte, 53 ok, 103 leer, 0 Ausreißer.
- Im eingebauten Browser durchgeklickt: 1366 × 768, Tablet (768 × 1024), 375 × 812 und 320 × 568, jeweils Szene, Schublade und Leseebene, Tag und Nacht. Keine Konsolenfehler.
- Tastatur: Escape schließt erst die Leseebene (zurück zur Schublade), dann die Schublade, der Fokus kehrt zum Schubladen-Knopf zurück.
- Startseite überträgt rund 115 KB, größte Datei ist `vendor/marked.min.js` mit 35 KB.

## Notizen für spätere Sitzungen

- Zehn Modellbilder liegen unter `assets/diagramme/` (je rund 2 KB, einheitlicher Stil: 640 Einheiten breit, Schulfarbe, Systemschrift). Noch offen aus den Vorschlägen: Crowding-out, Multiplikator, Laffer-Kurve, tendenzieller Fall der Profitrate.
- Die Kernsätze sind aus Fachwissen formuliert und noch nicht einzeln mit Quellen belegt. Die Belege entstehen zusammen mit den ausführlichen Antworten. Heikle Stellen stehen in `REVIEW.md`.
- Feinschliff-Ideen für später: Schublade am Nachttisch sichtbar herausfahren lassen, Szene auf sehr breiten Bildschirmen (oberer Fensterrand wird beschnitten), Druckansicht, `assets/szene/` ist ungenutzt, weil die Szene inline in `index.html` liegt.

## Geprüft in Sitzung 2

- Wortzahl-Skript: 173 Abschnitte, 89 ok, 84 leer, 0 Ausreißer. Alle Grundlagentexte liegen im Sollbereich.
- Alle `[[Begriffe]]` in allen Inhaltsdateien haben einen Glossareintrag (per Skript im Browser geprüft), keine langen Gedankenstriche.
- Fakten per Websuche geprüft, Liste und offene Punkte in `REVIEW.md` unter „Sitzung 2“.
- Im Browser angesehen (Nacht): Postkeynesianismus und „Weitere Theorien“ in Desktopbreite, Marxismus mit allen fünf Schubladen und das Glossar bei 375 px. Keine Konsolenfehler. Den Tagmodus habe ich in dieser Sitzung nicht erneut geprüft.
- Zwischenüberschriften in Grundlagentexten stehen auf Ebene 3 (`###`), weil der Schubladentitel schon Ebene 2 ist.

## Geprüft in Sitzung 3

- Wortzahl-Skript: 173 Abschnitte, 131 ok, 42 leer (Fragen 7 bis 12), 0 Ausreißer.
- Per Skript im Browser: Alle `[[Begriffe]]` der Fragen 1 bis 6 haben einen Glossareintrag, alle sechs Abbildungen werden ausgeliefert, keine langen Gedankenstriche.
- Im Browser angesehen (Desktopbreite, Nacht): alle sechs Diagramme einzeln, Frage 3 und Frage 5 mit geöffneten Schubladen. Keine Konsolenfehler. Mobilbreite und Tagmodus in dieser Sitzung nicht erneut geprüft.
- Quellen per Websuche geprüft, offene Punkte in `REVIEW.md` unter „Sitzung 3“.

## Geprüft in Sitzung 4

- Wortzahl-Skript: 173 Abschnitte, 173 ok, 0 leer, 0 Ausreißer.
- Per Skript im Browser über alle 29 Inhaltsdateien: jeder `[[Begriff]]` hat einen Glossareintrag, alle 11 Bildverweise werden ausgeliefert, keine langen Gedankenstriche.
- Im Browser angesehen: alle vier neuen Diagramme einzeln (Desktop), Frage 11 mit geöffneten Schubladen bei 375 px, Startszene bei 375 px im Tagmodus. Keine Konsolenfehler.
- Behoben: Abbildungen wurden mit verzögertem Laden eingebunden und erschienen in aufgeklappten Schubladen teils nicht sofort. Sie laden jetzt direkt.
- Neu und nur teilweise geprüft: Auf schmalen Bildschirmen sind Diagramme seitlich verschiebbar (Stilregel in `css/lesen.css`).

## Was als Nächstes sinnvoll ist (nach dem Sitzungsplan)

- [ ] `REVIEW.md` durchgehen: Die offenen Punkte aus allen vier Sitzungen sind die eigentliche Restarbeit am Inhalt.
- [ ] Wörtliche Marx-Zitate und alle Seitenangaben an den Originalen prüfen.
- [ ] Glossar gegen ein Lehrbuch abgleichen und um Begriffe aus den Fragen 7 bis 12 ergänzen (z. B. Leistungsbilanz, Emissionshandel, Verbriefung, Imperialismus).
- [ ] Echte Datengrafiken mit geprüften Reihen: Lohnstückkosten im Euroraum, Schuldenquoten, Leistungsbilanzen.
- [ ] Design-Feinschliff durch ein anderes Modell (Szene, Schubladen-Animation am Nachttisch, Druckansicht).
