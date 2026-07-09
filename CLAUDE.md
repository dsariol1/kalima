# Kalima+ – Projektkontext

## Projekt

Kalima+ ist ein clientseitiger Vokabeltrainer für modernes Hocharabisch (Fusha).

Ziel ist strukturiertes Lernen mit Spaced Repetition (FSRS).

Jede Vokabel besitzt zwei unabhängige Lernkarten:

- Erkennen (Arabisch → Deutsch)
- Produzieren (Deutsch → Arabisch)

Produktionskarten werden erst freigeschaltet, wenn die Erkennungskarte mindestens einmal erfolgreich beantwortet wurde.

---

## Architektur-Regeln

- Nur `src/srs/scheduler.js` importiert `ts-fsrs`.
- Persistenz ausschließlich über `src/db/db.js` (Dexie).
- Keine Verwendung von `localStorage`.
- Dexie speichert `Date`-Objekte nativ.
- Kartenverwaltung und Scheduling bleiben strikt getrennt.
- Karten-ID:

`${vocabId}::${direction}`

---

## Datenmodell

Vokabel:

```ts
{
  id,
  bookId,
  unit,
  unitDe,
  pos,
  ar,
  bare,
  translit,
  de,
  root,
  rootMeaning,
  example
}
```

`bare` enthält den arabischen Text ohne Harakat.

---

## UI-Regeln

- UI auf Deutsch
- Arabische Inhalte bleiben unverändert
- Umschrift wird nicht angezeigt
- Harakat können während des Reviews optional eingeblendet werden
- Produktionskarten besitzen eine Bildschirmtastatur
- Cursorposition muss beim Tippen erhalten bleiben

---

## Inhaltsstruktur

Bücher bestehen aus Kapiteln.

Kapitelnummern werden ausschließlich zur Laufzeit erzeugt.

Kapitel mit den Titeln

- Pronomen
- Adverbien
- Präpositionen

werden immer ans Ende sortiert und nicht nummeriert.

---

## Import

Bulk-Import ist fehlertolerant.

Ungültige Zeilen werden gemeldet.

Der Import wird nicht abgebrochen.

---

## Tech Stack

- React 19
- Vite
- Dexie
- ts-fsrs v5
- lucide-react

Fonts:

- Amiri
- Fraunces
- Inter

---

## Urheberrecht

Keine Lehrbuchtexte, Dialoge oder Übungen reproduzieren.

Nur Sprachfakten:

- Wörter
- Bedeutungen
- selbst geschriebene Beispielsätze

---

## Coding-Regeln

- Bestehende Architektur respektieren.
- Vorhandene Komponenten bevorzugt erweitern statt neue anzulegen.
- Geschäftslogik nicht duplizieren.
- Scheduler und Persistenz nicht vermischen.
- Kleine, klar abgegrenzte Komponenten bevorzugen.
- Änderungen möglichst minimal und konsistent halten.

---

## Befehle

npm run dev

npm run build

npm run lint