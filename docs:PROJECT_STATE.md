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
1. Al-ʿArabiyya bayna Yadayk — Band 1 (aby-1): **188 Wörter, 11 Kapitel**
   (8 nummerierte Themenkapitel: Begrüssung & Vorstellung, Familie, Das Haus,
   Das tägliche Leben, Essen & Trinken, Das Gebet, Das Studium & Lernen,
   Die Arbeit & der Beruf; 3 unnummerierte Grammatik-Kapitel am Ende:
   Pronomen, Adverbien, Präpositionen). Jedes Wort mit deutschem
   Beispielsatz; Wurzel + Wurzelbedeutung bei Nomen/Verben/Adjektiven wo
   sinnvoll (nicht bei Pronomen/Partikeln/Präpositionen).
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
4. Wurzelfamilien (roots): Pseudo-Buch, leer bis der Nutzer Wörter aus dem
   Wurzel-Explorer übernimmt (siehe unten). Erscheint in der Bücherliste erst,
   sobald mindestens ein Wort übernommen wurde (total > 0 gefiltert).

Kapitel-Nummerierung wird zur Render-Zeit in books.js vergeben (nicht in den
Vokabeldaten gespeichert), damit sie immer lückenlos bleibt, egal ob Kapitel
dazukommen/wegfallen. Ausnahme: Kapitel, die EXAKT "Pronomen", "Adverbien"
oder "Präpositionen" heißen, werden unnummeriert ans Ende sortiert (in dieser
Reihenfolge) — Erkennung ist exakter Namensvergleich, kein Teilstring-Match
(sonst würde z.B. "Demonstrativpronomen" fälschlich mit einsortiert).

## Wurzel-Explorer (Beta) — src/components/RootExplorer.jsx
Eigenständiges Lern-Feature neben dem Kern-Flashcard-System: visualisiert
arabische Wortfamilien radial um eine Wurzel, mit Fokus auf morphologischen
Transfer (Wurzel + وزن-Muster → Bedeutung erschliessen) statt Auswendiglernen.

**Daten:** src/data/rootFamilies.js — vier ausgearbeitete Wurzeln (ك ت ب
schreiben, د ر س lernen, ع م ل tun/arbeiten, س ك ن wohnen), je 8–11 Wörter
mit Segmentierung (Wurzelbuchstaben vs. Muster-Zeichen), Muster (وزن) +
zentral aufgelöster Musterbedeutung (`PATTERN_MEANINGS`, dieselbe Formulierung
wiederholt sich bewusst über alle Wurzeln — trainiert Mustererkennung),
Parallelen aus anderen Wurzeln, eigenem Beispielsatz. `WORD_INDEX` verknüpft
alle Familien für klickbare Cross-Referenzen.

**Ansichten** (Segmented Control [Wurzeln | Muster | Quiz]):
- Wurzeln: Radial-Graph, Klick zentriert ein Wort neu; Detailpanel rechts
  (Desktop) bzw. darunter (Mobile) zeigt Muster, Parallelen, Beispiel,
  Wortschatz-Status. "Weitere Ableitungen" blendet seltene Wörter ein.
- Muster: alle Wörter aller Wurzeln nach وزن gruppiert (Grid) — macht
  sichtbar, dass z.B. مَفْعَل bei drei Wurzeln denselben Ortsbezug erzeugt.
- Quiz: gestufte Tipps (Wurzel/Muster einzeln aufdeckbar statt sofort
  sichtbar), Distraktoren bevorzugt gleiche Wurzel/anderes Muster bzw.
  gleiches Muster/andere Wurzel (nicht rein zufällig), zwei Fragerichtungen
  (Arabisch→Deutsch und umgekehrt), Score trackt "ohne Tipp gelöst" separat.

**Anbindung an echte Vokabeln:** Wörter, die bereits im Lernwortschatz
stecken, bekommen ein Häkchen + Fundstelle. Match über `normalizeCitation`
(nur auslautende Fallvokal-Endung entfernt, nicht alle Harakat) — verhindert
Verwechslung von Homographen wie مَدْرَسَة "Schule" vs. مُدَرِّسَة "Lehrerin",
die beide zu "مدرسة" würden, wenn man komplett harakat-frei vergliche.
"Als Vokabel lernen"-Button übernimmt ein entdecktes Wort direkt in den
SRS-Lernwortschatz (Pseudo-Buch "Wurzelfamilien").

**Einstieg:** vom Dashboard ("Wurzel-Explorer (Beta)"-Link) oder aus einer
Flashcard heraus (nur Karten mit einer der vier Demo-Wurzeln zeigen
"Wurzelfamilie erkunden"). Öffnet als **Overlay** (nicht als eigene View) —
eine laufende Review-Session bleibt dabei gemountet und läuft nach dem
Schliessen exakt an derselben Karte weiter.

**Layout:** eigene breite Bühne (App.jsx-Overlay, maxWidth 1080 statt der
560px-Spalte des Rests der App). Desktop ab 900px Containerbreite:
Zwei-Spalten-Layout, Graph links (füllt Breite, Höhe wächst mit Viewport bis
640px statt fixer Konstante), Detailpanel rechts. Kein sticky Header mehr.
Radien aus Breite UND Höhe berechnet (nicht mehr `ry = rx · Faktor`). Ab 8
Satelliten gestaffelte Ringe + verkleinerte Knoten gegen Überlappung. Auf
schmalen Screens (<420px Graphbreite) zeigen Satelliten nur das arabische
Wort (drei Textzeilen passen dort geometrisch nicht, unabhängig vom Radius).

Bekannter behobener Bug: Ansichtswechsel Wurzeln→Muster→Wurzeln liess den
Graphen kollabieren (ResizeObserver hing am unmountenden Graph-Div). Fix:
Messung sitzt auf einem immer gerenderten Wrapper.

Prototyp-Charakter: nur 4 Wurzeln ausgearbeitet, keine Persistenz von
Quiz-Fortschritt (Session-State), kein Audio.

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
Landing Page ist ein Dashboard: Begrüßung (zeitbasiert: Morgen/Tag/Abend),
Statistik-Karte mit heute fälligen/neuen Karten gesamt (zählt via
countDueFresh über alle Bücher, keine eigene Zähllogik), darunter BookList
(nur Bücher mit Gesamtzahlen > 0), darunter Link zum Wurzel-Explorer. Klick
auf ein Buch öffnet BookDetail (Kapitelliste + "Ganzes Buch üben" +
Add-Buttons). Von dort: Review-Session, Add-Word, Bulk-Add — alle
Rücksprünge führen kontextgerecht zurück zu BookDetail, nicht bis zur
Landing Page durch.

Einstellungen + Backup/Export liegen hinter einem Zahnrad-Icon im Header
(nur auf der Dashboard-Ansicht sichtbar) in einer eigenen 'settings'-Ansicht
(App.jsx state machine: 'books' -> 'settings' oder 'bookDetail' ->
'review'/'add'/'bulkAdd'). Der Wurzel-Explorer ist keine eigene View,
sondern ein Overlay-State (`explorer`), unabhängig von der aktuellen View
öffen-/schliessbar.

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

Branding: "Kalima+" (Logo public/KalimaLogo.png, Icon + Wortmarke in einem
Bild integriert).

## Visuelles Design ("Frisch-modern" Redesign)
Palette komplett getauscht: von warmem Pergament/Hairline-Look auf helles
Off-White (`C.bg` #F6F8F7) mit weißen Karten (`C.surface`) und weichem
Schatten statt durchgängiger 1px-Hairlines. Primärfarbe sattes Grün-Teal
(`C.primary` #0F766E), Akzent warmes Gold (`C.gold` #A16207), Fehler/Erfolg
über `C.danger`/`C.success`. Alle Tokens in src/theme.js semantisch benannt
(text/textSoft/bg/surface/surfaceMuted/primary/primarySoft/gold/goldSoft/
danger/dangerSoft/success/border), WCAG-AA-Kontraste geprüft. Buch-Akzente
(books.js) mitgezogen: aby-1 teal, quran-core gold, quran-80 stahlblau
(#3A6B8C), Wurzelfamilien lila (#7C5CBF).

Geteilte Style-Primitives (auch in theme.js, kein neues Modul): `card`,
`primaryBtn`, `linkBtn`, `backBtn`, `inputStyle`, `fieldLabel`, `pill()` —
ersetzen vormals pro Komponente kopierte Inline-Style-Objekte. Favicon:
Teal-Quadrat mit weißem ك + goldenem Plus. Kein Dark Mode, kein Routing,
kein CSS-Framework.

## Bekannte offene Punkte / mögliche nächste Schritte
- Quran-80-Buch: Etappe 1+2 von vermutlich ~40 Kapiteln aus der Quelle.
- Wurzel-Explorer: nur 4 von potenziell vielen Wurzeln ausgearbeitet;
  Erweiterung auf weitere Wurzeln aus dem bestehenden Wortschatz denkbar.
- Logo-Hintergrund: geprüft, aktuell integriert via mix-blend-mode.
- Kein UI zum Umbenennen/Neuordnen von Kapiteln durch den Nutzer selbst
  (aktuell nur über Code-Änderungen durch Claude) — bewusst nicht gebaut,
  da seltene Aktion; Aufwand/Nutzen wurde mit Nutzer besprochen.
- Kein automatischer Datei-Sync (nur manueller JSON-Export/Import) —
  File System Access API (Chrome/Edge-only) wäre ein Weg, wurde noch nicht
  umgesetzt.
- Eigene Domain/Deployment: noch nicht umgesetzt, Optionen (Vercel/Netlify/
  GitHub Pages/eigener Server) mit Nutzer besprochen — App ist als reine SPA
  ohne Backend auf jedem Static-Hosting lauffähig.

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
1f092ab feat: expand ABY Book 1 to 188 words with roots and example sentences

Unstaged Änderungen (Wurzel-Explorer V2+V3, siehe Feature-Abschnitt oben):
App.jsx, BookList.jsx, Flashcard.jsx, RootExplorer.jsx, data/books.js,
data/rootFamilies.js.
