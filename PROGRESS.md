# PROGRESS

Stand: 11.11.2026, Ende Sitzung 1. Bei „mach weiter“ geht es beim ersten offenen Punkt weiter.

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

- [ ] Neoklassik: Entstehung (400–600), Aktueller Stand (250–400), Debatten (200–400), Strömungen (150–300)
- [ ] Postkeynesianismus: dieselben vier Texte
- [ ] Marxismus: dieselben vier Texte
- [ ] „Weitere Theorien“: sieben Steckbriefe (je 60–120 Wörter), Verweis auf Exploring Economics steht schon
- [ ] Glossar ausbauen (umstrittene Begriffe: Wert, Gleichgewicht, Geld, Profit, Arbeit/Arbeitskraft)

## Sitzung 3 – Problemfelder I und II

- [ ] Frage 1: Antworten, Quellen, Konflikt, Modellbild
- [ ] Frage 2
- [ ] Frage 3
- [ ] Frage 4
- [ ] Frage 5
- [ ] Frage 6

## Sitzung 4 – Problemfelder III und IV

- [ ] Frage 7
- [ ] Frage 8
- [ ] Frage 9
- [ ] Frage 10
- [ ] Frage 11
- [ ] Frage 12

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

- Noch keine Modellbilder. Die Einbindung steht (siehe README, Abschnitt Schreibkonventionen), `assets/diagramme/` ist leer.
- Die Kernsätze sind aus Fachwissen formuliert und noch nicht einzeln mit Quellen belegt. Die Belege entstehen zusammen mit den ausführlichen Antworten. Heikle Stellen stehen in `REVIEW.md`.
- Feinschliff-Ideen für später: Schublade am Nachttisch sichtbar herausfahren lassen, Szene auf sehr breiten Bildschirmen (oberer Fensterrand wird beschnitten), Druckansicht, `assets/szene/` ist ungenutzt, weil die Szene inline in `index.html` liegt.
