# فُصحى — Wortschatz

Ein Vokabeltrainer für Hocharabisch (Fusha), gebaut auf **Spaced Repetition** mit
dem produktiven FSRS-Algorithmus. Fokus: Quran-Kernwortschatz und Lehrbücher für
Nicht-Muttersprachler, beginnend mit *Al-ʿArabiyya bayna Yadayk, Band 1*.

## Was drin ist

- **FSRS-Scheduling** über die Bibliothek [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) —
  plant jede Karte so, dass eine Ziel-Behaltensrate (Standard: 90 %) getroffen wird.
- **Wurzel-basiertes Lernen** — beim Aufdecken erscheint die triliterale Wurzel mit
  ihrer Wortfamilie (كتب → كِتاب، كاتِب، مَكتَبة). Der eigentliche Hebel für Arabisch.
- **Buch-Kollektionen** — Vokabular nach Lehrbuch und Lektion geordnet, auswählbar.
- **Eigene Wörter** — während du mit deinem Buch lernst, trägst du die Vokabeln ein,
  die dir begegnen. Sie werden lokal im Browser gespeichert (IndexedDB via Dexie).
- **RTL + Harakat-Umschalter**, Audio über die Browser-Sprachausgabe.

## Loslegen

```bash
npm install
npm run dev
```

Dann `http://localhost:5173` öffnen. Build für Produktion: `npm run build`.

## Aufbau

```
src/
├── data/
│   ├── books.js            Buch-Registry + Buch→Lektion-Baum
│   └── vocab/
│       ├── abyBook1.js     ABY Band 1 – Starter-Wortschatz
│       └── quranCore.js    Quran-Kernwurzeln
├── srs/scheduler.js        ts-fsrs-Wrapper (einziger Ort, der ts-fsrs kennt)
├── db/db.js                Dexie / IndexedDB (Fortschritt, eigene Wörter, Verlauf)
├── hooks/useReview.js      Session-Engine: Queue, Bewerten, Persistenz
├── components/             BookPicker, ReviewSession, Flashcard, GradeButtons, AddWord
├── utils/                  speak (TTS), interval (Formatierung)
└── theme.js                Farbpalette
```

## Ein Lehrbuch hinzufügen

1. Vokabeldatei unter `src/data/vocab/` anlegen (Shape wie in den vorhandenen Dateien).
2. In `src/data/books.js` importieren, zu `BUILTIN_VOCAB` hinzufügen und einen
   `BOOK_META`-Eintrag ergänzen. Der Lektionsbaum entsteht automatisch aus dem Feld `unit`.

## Zum Urheberrecht

Die einzelnen Wörter und ihre Bedeutungen sind Sprachfakten und in jedem
Anfängerkurs enthalten. Dieses Projekt reproduziert **nicht** den Inhalt der
Lehrbücher (Dialoge, Beispielsätze, Übungen, Grammatik). Die mitgelieferten
Beispielsätze sind eigene, einfache Konstruktionen. Baue dein persönliches Deck
über „Eigenes Wort hinzufügen" aus deinem tatsächlichen Lernstoff auf.

## Nächste Schritte (Ideen)

- Recognition- und Production-Karten getrennt planen (sehen↔produzieren).
- Ziel-Behaltensrate und tägliches Neu-Limit als Einstellung.
- Echte Audiodateien statt Browser-TTS.
- KI-Anbindung (Anthropic-API): Beispielsätze on-demand, Wurzel-/Formanalyse,
  Bewertung von Tippversuchen.
- Import/Export des Decks (JSON) für Backup und Gerätewechsel.
