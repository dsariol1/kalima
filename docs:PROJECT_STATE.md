KALIMA+ — PROJEKTSTATUS
(Stand: siehe letzter Commit unten)

## Was es ist
Arabisch-Vokabeltrainer (Fusha/Hocharabisch) als lokale Webapp. React 19 + Vite,
komplett clientseitig, keine Backend-Abhängigkeit. Fortschritt liegt in IndexedDB
(Dexie) im Browser des Nutzers — kein Server, kein Account, kein Cloud-Sync.

## Kernkonzept: getrennte Recognition-/Production-Karten
Jede Vokabel hat zwei unabhängige FSRS-Kartenzustände (ts-fsrs v5):
- Erkennen (Recognition): Arabisch → Deutsch. Immer sofort verfügbar.
- Produzieren (Production): Deutsch → Arabisch, aktive Texteingabe.
  Wird erst freigeschaltet, nachdem die Recognition-Karte desselben Worts
  mindestens einmal bewertet wurde (reps > 0).

Karten-ID: `${vocabId}::recognition` bzw. `${vocabId}::production` — komposite
Primärschlüssel in der Dexie `progress`-Tabelle. Architektur-Regel: nur
src/srs/scheduler.js importiert ts-fsrs direkt; src/srs/cards.js kennt nur
ID-Schema + Freischalt-Logik, keine FSRS-Details.

Bewertung: zwei Buttons statt der üblichen vier FSRS-Stufen — "Nochmal"
(= Rating.Again, kurzes Intervall) und "Weiß ich" (= Rating.Good, langes
Intervall). Hard/Easy sind ungenutzt.

## Bücher (Stand jetzt)
1. Al-ʿArabiyya bayna Yadayk — Band 1 (aby-1): 19 Wörter, 3 Kapitel
   (Begrüssung & Vorstellung, Familie, Das Haus)
2. Quran-Kernwortschatz (quran-core): 18 Wörter, 3 Kapitel (Wurzelfamilien)
3. 80 % der Quran-Wörter (quran-80): 136 Wörter, 12 Kapitel — ETAPPE 1+2 einer
   größeren Transkription aus "80% of Qur'anic Words" (Dr. Abdulazeez
   Abdulraheem, Islamic Book Trust 2009, private Kopie des Nutzers, PDF
   bildbasiert/nicht textextrahierbar). Nur Wort→Bedeutung-Paare übernommen
   (Sprachfakten), ins Deutsche übersetzt, kein Fließtext aus der Quelle.
   Etappe 1 (Seiten 1–3): Demonstrativ-/Personalpronomen, Verneinung,
   Possessivsuffixe, Ortswörter, Fragewörter. Etappe 2 (Seiten 4–6):
   Zeitangaben, Verschiedenes, häufige Präpositionen, Präpositionen mit مَا,
   Verbpräfixe, Inna-Gruppe. Nächste mögliche Etappe (Seiten 7+): Attribute
   Allahs, Ism Tafḍīl — dort führt die Quelle zusätzlich Frequenzangaben, noch
   nicht übernommen. Genehmigungs-Mail an den Compiler (Dr. Abdulraheem) zur
   Nutzung der Wortlisten wurde entworfen, Versand-Status offen.

Kapitel-Nummerierung wird zur Render-Zeit in books.js vergeben (nicht in den
Vokabeldaten gespeichert), damit sie immer lückenlos bleibt, egal ob Kapitel
dazukommen/wegfallen. Ausnahme: Kapitel, die EXAKT "Pronomen", "Adverbien"
oder "Präpositionen" heißen, werden unnummeriert ans Ende sortiert (in dieser
Reihenfolge) — Erkennung ist exakter Namensvergleich, kein Teilstring-Match
(sonst würde z.B. "Demonstrativpronomen" fälschlich mit einsortiert).

## Nutzer-Workflows
- Eigenes Wort hinzufügen: Einzelformular pro Buch/Kapitel.
- Vokabelliste einfügen: Bulk-Import, ein Wort pro Zeile im Format
  "Arabisch / Deutsch / Umschrift? / Wurzel? / Wurzelbedeutung?" (nur
  Arabisch+Deutsch Pflicht, Trennzeichen ist "/" — Feldwerte selbst dürfen
  kein "/" enthalten). Ungültige Zeilen werden übersprungen und mit
  Zeilennummer gemeldet statt den Import abzubrechen.
- Export/Import: JSON-Backup des kompletten lokalen Zustands (Fortschritt,
  eigene Vokabeln, Review-Log, Einstellungen). Nicht-destruktiv beim Import
  (bulkPut/Upsert), Datei-Namensmuster fusha-vocab-backup-*.json ist
  .gitignored (Lernerdaten, kein Quellcode).
- Einstellungen: Ziel-Behaltensrate (70–97 %, Default 90 %) und neue Karten
  pro Sitzung (1–50, Default 15, gilt getrennt pro Richtung).

## UI-Struktur (Dashboard-Startseite + zweistufige Navigation)
Landing Page ist jetzt ein Dashboard: Begrüßung (zeitbasiert: Morgen/Tag/Abend),
Statistik-Karte mit heute fälligen/neuen Karten gesamt (zählt via
countDueFresh über alle Bücher, keine eigene Zähllogik), darunter BookList
(nur Bücher mit Gesamtzahlen). Klick auf ein Buch öffnet BookDetail
(Kapitelliste + "Ganzes Buch üben" + Add-Buttons). Von dort: Review-Session,
Add-Word, Bulk-Add — alle Rücksprünge führen kontextgerecht zurück zu
BookDetail, nicht bis zur Landing Page durch.

Einstellungen + Backup/Export sind vom Dashboard entfernt und liegen jetzt
hinter einem Zahnrad-Icon im Header (nur auf der Dashboard-Ansicht sichtbar)
in einer eigenen 'settings'-Ansicht (App.jsx state machine: 'books' ->
'settings' oder 'bookDetail' -> 'review'/'add'/'bulkAdd').

Harakat-Toggle (Diakritika an/aus) ist nur während einer laufenden
Review-Session sichtbar, nicht auf den anderen Screens.

Production-Karte: Eingabefeld akzeptiert NUR arabische Schrift (mit oder
ohne Harakat) — Umschrift/Transliteration wurde bewusst entfernt (weder als
akzeptierte Antwort noch als Anzeige), um den Fokus auf die arabische Schrift
zu erzwingen. Das translit-Feld existiert im Datenmodell/in den Add-Formularen
weiter (optional), wird aber nirgends mehr gelesen oder angezeigt.

On-Screen-Arabisch-Tastatur (ArabicKeyboard.jsx): 34 Buchstaben (Alphabet +
Hamza-/Alif-Varianten + ة/ى) + Löschen-Taste, fügt an der aktuellen
Cursor-Position im Eingabefeld ein. Per Toggle-Button aus-/einklappbar,
Zustand liegt in ReviewSession (nicht in Flashcard, das pro Karte neu
gemountet wird) — bleibt darum über mehrere Production-Karten einer Sitzung
offen statt bei jeder Karte neu aufklappen zu müssen. Default: eingeklappt
(stört mobile Nutzer mit nativer Tastatur nicht).

Branding: "Kalima+" (Logo public/kalima-logo.png links, Wortmarke rechts
daneben), ersetzt das ursprüngliche "فُصحى Wortschatz".

## Visuelles Design ("Frisch-modern" Redesign)
Palette komplett getauscht: von warmem Pergament/Hairline-Look auf helles
Off-White (`C.bg` #F6F8F7) mit weißen Karten (`C.surface`) und weichem
Schatten statt durchgängiger 1px-Hairlines. Primärfarbe sattes Grün-Teal
(`C.primary` #0F766E), Akzent warmes Gold (`C.gold` #A16207), Fehler/Erfolg
über `C.danger`/`C.success`. Alle Tokens in src/theme.js semantisch benannt
(text/textSoft/bg/surface/surfaceMuted/primary/primarySoft/gold/goldSoft/
danger/dangerSoft/success/border), WCAG-AA-Kontraste geprüft. Buch-Akzente
(books.js) mitgezogen: aby-1 teal, quran-core gold, quran-80 stahlblau
(#3A6B8C, einzige Farbe außerhalb der theme.js-Palette).

Geteilte Style-Primitives (auch in theme.js, kein neues Modul): `card`,
`primaryBtn`, `linkBtn`, `backBtn`, `inputStyle`, `fieldLabel`, `pill()` —
ersetzen vormals pro Komponente kopierte Inline-Style-Objekte (betraf alle
10 Components). Favicon ersetzt (war ein nicht verlinkter lila Blitz-Rest),
jetzt Teal-Quadrat mit weißem ك + goldenem Plus, in index.html verlinkt.
Kein Dark Mode, kein Routing, kein CSS-Framework hinzugekommen.

## Bekannte offene Punkte / mögliche nächste Schritte
- Quran-80-Buch: Etappe 1+2 von vermutlich ~40 Kapiteln aus der Quelle.
- Logo-Hintergrund ist noch cremefarben (nicht transparent) — Pillow/
  ImageMagick nicht installiert, um das freizustellen.
- Kein UI zum Umbenennen/Neuordnen von Kapiteln durch den Nutzer selbst
  (aktuell nur über Code-Änderungen durch Claude) — bewusst nicht gebaut,
  da seltene Aktion; Aufwand/Nutzen wurde mit Nutzer besprochen.
- Kein automatischer Datei-Sync (nur manueller JSON-Export/Import) —
  File System Access API (Chrome/Edge-only) wäre ein Weg, wurde noch nicht
  umgesetzt.

## Tech-Stack
React 19, Vite, Dexie (IndexedDB), ts-fsrs v5, lucide-react (Icons).
Kein Backend, kein Build-Server außer lokalem `npm run dev`.

## Wichtige Architektur-Regeln (aus CLAUDE.md, weiter gültig)
- Nur scheduler.js importiert ts-fsrs.
- Buch→Lektion-Baum wird aus den Vokabeldaten abgeleitet (buildBookTree),
  nicht doppelt gepflegt.
- Keine Lehrbuchinhalte reproduzieren (Dialoge, Originalsätze, Übungen,
  Grammatik-Erklärungen) — nur einzelne Wörter + Bedeutungen (Sprachfakten)
  und eigene Beispielsätze.
- customVocab/Bulk-Import schreiben nie in die eingebauten Vokabeldateien,
  nur in die lokale Dexie-Datenbank.

## Letzter Commit
02e4a25 Neues Buch "80% der Quran-Woerter" — Etappe 1 (6 Kapitel, 64 Woerter)
