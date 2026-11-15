# PROGRESS

Stand: 15.11.2026, nach Sitzung 5. Der ursprüngliche Sitzungsplan ist abgearbeitet, die Seite ist veröffentlicht. Diese Datei ist die Übergabe für jede neue Sitzung.

## Start hier (neue Sitzung)

1. Diese Datei lesen, danach `REVIEW.md` (Abschnitt „Weiter offen“) und bei Bedarf `README.md` (Aufbau, Schreibkonventionen, Jahreszeiten).
2. `git status` und `git log --oneline -5` ansehen. Der Arbeitsstand ist sauber und vollständig gepusht (letzter Commit vor dieser Übergabe: `4365ce1`).
3. Vorschau starten (`tools/serve.ps1`, Port 8765) und die Seite einmal ansehen.
4. Bei „mach weiter“ ohne weiteren Auftrag: beim ersten offenen Punkt unter „Offen“ beginnen.

Live: https://thjabs.github.io/wirtschaft-verstehen/ · Repo: `thjabs/wirtschaft-verstehen` (öffentlich, GitHub Pages aus `main`, Ordner `/`).

## Was es gibt

- **Inhalte, vollständig:** 12 Fragen mit je drei Kernsätzen, drei ausführlichen Antworten, Quellen und Konflikt-Schublade. Grundlagen für drei Schulen (je fünf Schubladen, die fünfte ist „Zum Weiterlesen“), sieben Steckbriefe „Weitere Theorien“, Glossar mit 53 Begriffen.
- **Modellbilder:** zehn schematische SVGs unter `assets/diagramme/` (Frage 10 verwendet das Bild aus Frage 1, Frage 12 hat keines).
- **Szene:** Zimmer mit Nachttisch (fünf Schubladen), Fenster mit Altstadt, Tag/Nacht, vier Jahreszeiten, Pause-Knopf, Wandkalender, Lichtschalter.
- **Leseebene:** Papierbogen mit Kernsätzen, Schubladen, Glossar-Tooltips, Inhaltsverzeichnis, Glossar-Ansicht, Deep-Links.
- **Werkzeuge:** `tools/serve.ps1` (Vorschau), `tools/wortzahl.ps1` (Wortzahlen).

## Offen

Nach Wichtigkeit geordnet. Nichts davon blockiert die Seite.

- [ ] **Inhalt gegenlesen (Mensch):** Die Punkte unter „Weiter offen“ in `REVIEW.md`, vor allem die sinngemäß wiedergegebenen Positionen einzelner Autoren und die dort genannten Entscheidungen.
- [ ] **Glossar gegen ein Lehrbuch abgleichen.** Die 53 Einträge folgen dem üblichen Gebrauch, sind aber nicht mit einem Lehrbuch verglichen.
- [ ] **Restliche Quellenangaben prüfen:** Ramsey 1927 (Band und Seiten), Brenner 2006, Kliman 2012, Amin 1976 (Verlag), Seiten bei Hart/Zingales 2017, Titel der IMK/IW-Studie 2024.
- [ ] **Zahlen mit schwachem Beleg:** Tarifbindung 2024 (Frage 4), Unternehmen als Sparer (Fragen 1 und 3), Welthandel seit 1950 (Frage 8), UNCTAD-Wert zu Rohstoffen (Frage 9).
- [ ] **Echte Datengrafiken** mit geprüften Reihen statt Schemata: Lohnstückkosten im Euroraum, Schuldenquoten, Leistungsbilanzen.
- [ ] **Weitere Modellbilder** aus den Vorschlägen der Spezifikation: Crowding-out, Multiplikator, Laffer-Kurve, tendenzieller Fall der Profitrate.
- [ ] **Geräte und Browser:** Die Seite ist nur im eingebauten Browser der Claude-App geprüft. Offen sind echte Telefone, Firefox und Safari, dazu Sommer bei Tag und die verschiebbaren Diagramme auf schmalen Bildschirmen.
- [ ] **Feinschliff-Ideen:** Schublade am Nachttisch sichtbar herausfahren lassen, Druckansicht, sehr breite Bildschirme (oberer Fensterrand wird beschnitten), Kopfleiste bei 320 px (fünf Knöpfe brechen um).

## Am Ende jeder Sitzung

- Wortzahl-Skript laufen lassen: `powershell -NoProfile -ExecutionPolicy Bypass -File tools\wortzahl.ps1 -NurProbleme`
- Seite lokal durchklicken (Desktop und 375 px, Tag und Nacht, mindestens zwei Jahreszeiten).
- `REVIEW.md` und diese Datei aktualisieren, gezielt committen (kein `git add .`), vor dem Push in einem Satz sagen, was hochgeht.
- Vor jedem Push prüfen, dass keine lokalen Pfade oder Namen im Stand sind: `git grep -n -i -E "One[D]rive|U[s]ers" HEAD -- . ":!vendor"` muss leer sein. `CLAUDE.md` bleibt lokal (steht in `.gitignore`).

## Stolpersteine, die schon Zeit gekostet haben

- **GitHub Pages braucht `.nojekyll`** im Wurzelordner, sonst werden die Markdown-Dateien mit Kopfzeilen nicht ausgeliefert. Die Datei ist da und muss bleiben.
- **Zwischenüberschriften in Grundlagentexten** mit `###`, weil der Schubladentitel schon Ebene 2 ist.
- **Kein `&amp;` in Markdown** schreiben, einfach `&`.
- **Abbildungen ohne verzögertes Laden**, sonst fehlen sie in frisch aufgeklappten Schubladen.
- **Animationen der Leseebene ändern nur die Position, nicht die Deckkraft**, damit Inhalt nie unsichtbar hängen bleibt.
- **Neue Glossarbegriffe:** Eintrag in `inhalte/glossar.md` anlegen (Reihenfolge egal) und im Text als `[[Eintrag]]` oder `[[Eintrag|Text im Satz]]` markieren. Jede Markierung braucht einen Eintrag.
- **PowerShell-Skripte bleiben reines ASCII**, weil PowerShell 5.1 Dateien ohne BOM als ANSI liest.

## Erledigt

- **Sitzung 1:** Fundament, Szene in Grundform, Leseebene, Inhalts-Pipeline, alle 36 Kernsätze, Veröffentlichung auf GitHub Pages.
- **Sitzung 2:** Grundlagen der drei Schulen, Weitere Theorien, Glossar-Grundstock.
- **Sitzung 3:** Fragen 1 bis 6 mit Antworten, Quellen, Konflikt und sechs Modellbildern.
- **Sitzung 4:** Fragen 7 bis 12 mit Antworten, Quellen, Konflikt und vier Modellbildern.
- **Sitzung 5:** Abschlussprüfung aller offenen Quellen und Zahlen per Websuche, Korrekturen in den Texten, Glossar auf 53 Begriffe, vier Jahreszeiten, gemütlichere Szene und Leseebene.

## Letzter Prüfstand (Sitzung 5)

- Wortzahl-Skript: 195 Abschnitte, 195 ok, 0 Ausreißer.
- Alle 120 markierten Begriffe haben einen Glossareintrag, keine langen Gedankenstriche in den Inhalten.
- Im Browser angesehen: Herbst und Winter bei Nacht, Frühling und Herbst bei Tag (Desktop), Sommer bei Nacht und Winter bei Tag als Ausschnitt, Frühling bei Nacht bei 375 px, Frage 8 und Glossar. Keine Konsolenfehler.
- Live-Seite nach dem letzten Push geladen: Szene, Lichterkette und Kalender da, keine Konsolenfehler.
