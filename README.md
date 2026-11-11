# Wirtschaft verstehen

Zwölf zentrale Wirtschaftsfragen, beantwortet aus drei Denkschulen: **Neoklassik, Postkeynesianismus und Marxismus**. Die Seite ist als ruhige Nachtszene gebaut: ein Zimmer, ein Nachttisch mit fünf Schubladen, vor dem Fenster eine Altstadt. Die Inhalte liegen als Karteikarten in den Schubladen.

Jede Schule antwortet in ihrer eigenen Stimme (Innensicht). Vergleich und Kritik stehen nur in der Schublade „Wo sie sich widersprechen“ am Ende jeder Frage.

## Technik in einem Satz

Reines HTML, CSS und JavaScript, kein Framework, kein Build-Schritt, kein npm. Die Texte sind Markdown-Dateien unter `inhalte/` und werden im Browser geladen und mit `vendor/marked.min.js` (marked 12.0.2, MIT-Lizenz) umgewandelt.

## Aufbau

```
index.html              Seite mit der Szene (Inline-SVG)
css/basis.css           Farben (Tag/Nacht), Schrift, Kopfleiste
css/szene.css           Zimmer, Animationen, Nachttisch, Schubladenfach
css/lesen.css           Leseebene: Papier, Kernsätze, Schubladen, Glossar
js/inhalte.js           Dateien laden, Markdown und Abschnitte zerlegen
js/szene.js             Skalierung, Stadt und Sterne, Tag/Nacht, Pause
js/app.js               Nachttisch, Karten, Leseebene, Deep-Links, Tooltips
vendor/marked.min.js    Markdown-Parser (lokal, kein CDN)
assets/diagramme/       Modellbilder als SVG (je unter 30 KB)
inhalte/manifest.json   Reihenfolge, Titel und Dateien aller Schubladen
inhalte/glossar.md      Glossar
inhalte/fragen/         eine Datei pro Frage
inhalte/grundlagen/     vier Dateien pro Schule plus weitere-theorien.md
tools/serve.ps1         lokaler Vorschau-Server
tools/wortzahl.ps1      prüft die Wortzahlen
CLAUDE.md               Spezifikation des Projekts (nur lokal, nicht im Repo)
PROGRESS.md             Checkliste, was fertig ist
REVIEW.md               Prüfliste für heikle Stellen und ungeprüfte Quellen
```

## Lokale Vorschau

Die Seite lädt ihre Inhalte per `fetch`, deshalb braucht sie einen Webserver (ein Doppelklick auf `index.html` reicht nicht).

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools\serve.ps1
```

Danach im Browser `http://localhost:8765/` öffnen. Mit `-Port` lässt sich ein anderer Port wählen.

## Eine neue Frage ergänzen

Es sind genau zwei Schritte nötig.

**1. Datei anlegen**, zum Beispiel `inhalte/fragen/13-inflation.md`:

```markdown
---
id: 13
problemfeld: IV
frage: Woher kommt Inflation?
---

## Neoklassik

### Kernsatz

Ein bis zwei Sätze.

### Antwort

250 bis 500 Wörter (höchstens 600).

### Quellen

- Erste Quelle
- Zweite Quelle

## Postkeynesianismus

(gleicher Aufbau)

## Marxismus

(gleicher Aufbau)

## Wo sie sich widersprechen

150 bis 300 Wörter, neutral.
```

Die Überschriften müssen genau so heißen. Leere Abschnitte sind erlaubt, die Seite zeigt dann „Dieser Text ist noch nicht geschrieben.“

**2. Eintrag in `inhalte/manifest.json`** in der passenden Schublade unter `karten`:

```json
{ "id": "frage-13", "typ": "frage", "datei": "fragen/13-inflation.md", "titel": "Woher kommt Inflation?" }
```

Die `id` ist zugleich der Deep-Link (`#frage-13`). Nummerierung, Karteikarte, Inhaltsverzeichnis und Blättern entstehen automatisch aus dem Manifest.

Eine neue Schublade ist ein weiterer Eintrag unter `schubladen` (`id`, `nummer`, `etikett`, `titel`, `karten`). Der Nachttisch ist auf fünf Schubladen ausgelegt, mehr werden entsprechend flacher.

## Schreibkonventionen in den Markdown-Dateien

- **Glossarbegriffe:** `[[Mehrwert]]` markiert einen Begriff. Weicht die Form im Satz ab, steht zuerst der Glossareintrag, dann der angezeigte Text: `[[Externer Effekt|externen Effekten]]`. Beim Drüberfahren oder Antippen erscheint die Kurzerklärung.
- **Glossar (`inhalte/glossar.md`):** Jeder Begriff ist eine Überschrift der Ebene 2. Der erste Absatz ist die Kurzerklärung für den Tooltip (1–2 Sätze), alles danach erscheint nur in der Glossar-Ansicht. Bei umstrittenen Begriffen stehen dort die Bedeutungen je Schule.
- **Modellbilder:** `![Alt-Text](assets/diagramme/datei.svg "Bildunterschrift")` in einer eigenen Zeile. Der Titel in Anführungszeichen wird zur Bildunterschrift.
- **Externe Links** öffnen automatisch in einem neuen Tab.
- Keine langen Gedankenstriche, keine erfundenen Quellen. Unsicheres wird mit `[ungeprüft]` markiert und in `REVIEW.md` eingetragen.

## Deep-Links

| Link | Ziel |
|---|---|
| `#frage-01` … `#frage-12` | eine Frage |
| `#grundlagen-neoklassik`, `#grundlagen-postkeynesianismus`, `#grundlagen-marxismus` | Grundlagen einer Schule |
| `#weitere-theorien` | Steckbriefe weiterer Theorien |
| `#schublade-staat` (auch `grundlagen`, `arbeit`, `aussenhandel`, `krisen`) | aufgezogene Schublade |
| `#inhalt` | Inhaltsverzeichnis |
| `#glossar`, `#glossar-mehrwert` | Glossar, einzelner Begriff |

## Wortzahlen prüfen

```
powershell -NoProfile -ExecutionPolicy Bypass -File tools\wortzahl.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File tools\wortzahl.ps1 -NurProbleme
```

Das Skript meldet je Abschnitt `ok`, `leer`, `ZU KURZ` oder `ZU LANG` nach den Vorgaben in `CLAUDE.md`.

## Gestaltung

- Die Szene ist ein Inline-SVG mit 1600 × 900 Einheiten und wird per CSS-Variable `--s` skaliert. Häuser, Fensterlichter und Sterne erzeugt `js/szene.js` mit festem Zufallswert, die Stadt sieht also immer gleich aus.
- Tag und Nacht sind zwei Sätze von CSS-Variablen in `css/basis.css` (`data-thema` am `html`-Element). Die Wahl wird in `localStorage` gespeichert, ohne Speicherung folgt die Seite der Systemeinstellung.
- Der Pause-Knopf hält alle Animationen an (`data-bewegung`). Bei `prefers-reduced-motion` steht die Szene von Anfang an still.
- Paradigmenfarben auf dem Papier (`#f5eedd`): Petrol `#1f5f6b` (Kontrast etwa 6,3:1), Ocker `#8a5a00` (etwa 5,1:1), Aubergine `#6b3a6e` (etwa 7,4:1). Alle erfüllen WCAG AA für Text.
- Die Szene ist vollständig selbst gezeichnet und enthält keine Person und keine fremden Figuren.

## Veröffentlichung

Gedacht für GitHub Pages (Zweig `main`, Ordner `/`). Da es keinen Build-Schritt gibt, wird der Ordner so veröffentlicht, wie er ist.
