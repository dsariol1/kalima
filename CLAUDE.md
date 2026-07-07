# Projektkontext für Claude Code

Vokabeltrainer für Hocharabisch (Fusha). Spaced Repetition mit FSRS. React + Vite,
komplett clientseitig, keine Backend-Abhängigkeit.

## Architektur-Regeln

- **Nur `src/srs/scheduler.js` importiert `ts-fsrs`.** Alle Scheduling-Aufrufe laufen
  über diesen Wrapper, damit der Algorithmus austauschbar bleibt.
- **Persistenz ausschliesslich über `src/db/db.js`** (Dexie/IndexedDB). Kein
  `localStorage`, kein `window.storage`. FSRS-Karten speichern `Date`-Objekte —
  Dexie serialisiert die nativ, nicht manuell in JSON wandeln.
- **Vokabel-Shape** (einheitlich für Built-in und eigene Wörter):
  `{ id, bookId, unit, unitDe, pos, ar, bare, translit, de, root|null, rootMeaning|null, example?{ ar, de } }`
  `bare` = `ar` ohne Harakat (Unicode-Bereich U+064B–U+0652, U+0670).
- **Der Buch→Lektion-Baum wird abgeleitet**, nicht doppelt gepflegt: `buildBookTree()`
  in `books.js` gruppiert Vokabeln nach `bookId` und `unit`.

## Tech-Stack

- React 19, Vite 8, `ts-fsrs` v5, `dexie` v4, `lucide-react` für Icons.
- Styling ist inline über Tokens aus `src/theme.js` (bewusst kein CSS-Framework,
  klein genug). Arabische Schrift: Amiri. Display: Fraunces. UI: Inter.

## Urheberrecht — wichtig

Keine Lehrbuchinhalte reproduzieren (Dialoge, Originalsätze, Übungen, Grammatik).
Nur einzelne Wörter + Bedeutungen (= Sprachfakten) und eigene Beispielsätze.
Nutzer bauen ihr Deck über die „Eigenes Wort"-Funktion aus eigenem Lernstoff.

## Sprache

UI-Texte und Doku auf Deutsch. Code-Kommentare Englisch ist ok.

## Befehle

`npm run dev` · `npm run build` · `npm run lint`
