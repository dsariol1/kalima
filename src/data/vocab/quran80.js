// "80% der Quran-Wörter" — hochfrequente Quran-Vokabeln, nach Wortart geordnet.
//
// Abgeleitet aus der klassifizierten Wortliste "80% of Qur'anic Words"
// (Dr. Abdulazeez Abdulraheem), aus der eigenen Kopie des Lernenden.
// Übernommen werden NUR die einzelnen Wort→Bedeutung-Paare (Sprachfakten);
// kein Vorwort, keine Erklärtexte, keine Beispielsätze aus der Quelle.
// Bedeutungen ins Deutsche übersetzt, Kapitelnamen eigen formuliert.
// Kapitelnummern vergibt books.js zur Render-Zeit — hier keine Nummern.

const HARAKAT = /[ً-ْٰـ]/g;
const stripHarakat = (s) => s.replace(HARAKAT, '');

// Baut vollständige Vokabel-Einträge aus kompakten [ar, de]-Zeilen.
// translit bleibt leer (in der UI nicht mehr genutzt), root null (die Quelle
// gibt keine Wurzeln an — nicht raten).
function unit(id, unitDe, rows) {
  return rows.map(([ar, de], i) => ({
    id: `q80-${id}-${i + 1}`,
    bookId: 'quran-80',
    unit: id,
    unitDe,
    pos: 'word',
    ar,
    bare: stripHarakat(ar),
    translit: '',
    de,
    root: null,
    rootMeaning: null,
  }));
}

export const quran80 = [
  // ---- Demonstrativpronomen (This, that…) ----
  ...unit('demonstr', 'Demonstrativpronomen', [
    ['هَذَا', 'dieser (m)'],
    ['ذَلِكَ', 'jener (m)'],
    ['هَذِهِ', 'diese (f)'],
    ['تِلْكَ', 'jene (f)'],
    ['هَؤُلَاءِ', 'diese (Pl.)'],
    ['أُولَئِكَ', 'jene (Pl.)'],
    ['الَّذِي', 'derjenige, der (m)'],
    ['الَّتِي', 'diejenige, die (f)'],
    ['الَّذِينَ', 'diejenigen, die (Pl.)'],
  ]),

  // ---- Verneinung (No, No!) ----
  ...unit('negation', 'Verneinung', [
    ['لَا', 'nein; nicht'],
    ['إِلَّا', 'außer; wenn nicht'],
    ['كَلَّا', 'keineswegs; gewiss nicht'],
    ['لَنْ', 'nicht (Zukunft: wird nicht)'],
    ['لَمْ', 'nicht (Vergangenheit: hat nicht)'],
    ['مَا', 'nicht'],
    ['لَيْسَ', 'ist nicht; nicht sein'],
    ['بَلَى', 'doch (ja, nach Verneinung)'],
    ['غَيْر', 'nicht; anders als; außer'],
    ['دُونَ', 'außer; unterhalb; geringer als'],
    ['نَعَمْ', 'ja'],
  ]),

  // ---- Personalpronomen (Who?) ----
  ...unit('personal', 'Personalpronomen', [
    ['هُوَ', 'er'],
    ['هُمْ', 'sie (m, Pl.)'],
    ['أَنْتَ', 'du (m)'],
    ['أَنْتُمْ', 'ihr (m, Pl.)'],
    ['أَنَا', 'ich'],
    ['نَحْنُ', 'wir'],
    ['هِيَ', 'sie (f)'],
    ['هُنَّ', 'sie (f, Pl.)'],
    ['أَنْتِ', 'du (f)'],
    ['هُمَا', 'sie beide (Dual)'],
    ['أَنْتُمَا', 'ihr beide (Dual)'],
  ]),

  // ---- Possessivsuffixe (Whose?) ----
  ...unit('possessiv', 'Possessivsuffixe', [
    ['ـهُ', 'sein (m)'],
    ['ـهُمْ', 'ihr (m, Pl.)'],
    ['ـكَ', 'dein (m)'],
    ['ـكُمْ', 'euer (m, Pl.)'],
    ['ـِي', 'mein; mich'],
    ['ـنَا', 'unser; uns'],
    ['ـهَا', 'ihr (f)'],
    ['ـهُنَّ', 'ihr (f, Pl.)'],
    ['ـكِ', 'dein (f)'],
  ]),

  // ---- Ortswörter (Where?) ----
  ...unit('ort', 'Ortswörter', [
    ['فَوْقَ', 'über; oben'],
    ['تَحْتَ', 'unter'],
    ['بَيْنَ يَدَيْ', 'vor (wörtl. „zwischen den Händen von")'],
    ['خَلْفَ', 'hinter; nach'],
    ['أَمَامَ', 'vor'],
    ['وَرَاءَ', 'hinter'],
    ['يَمِين', 'rechts; Schwur'],
    ['شِمَال', 'links'],
    ['بَيْنَ', 'zwischen'],
    ['حَوْلَ', 'um … herum'],
    ['حَيْثُ', 'wo; da wo'],
    ['أَيْنَمَا', 'wo auch immer'],
  ]),

  // ---- Fragewörter (Questions) ----
  ...unit('frage', 'Fragewörter', [
    ['مَا', 'was'],
    ['مَنْ', 'wer'],
    ['مَتَى', 'wann'],
    ['أَيْنَ', 'wo'],
    ['كَيْفَ', 'wie'],
    ['كَمْ', 'wie viel(e)'],
    ['أَيّ', 'welcher'],
    ['أَنَّى', 'woher; wie'],
    ['هَلْ', 'ob …? (Fragepartikel)'],
    ['مَاذَا', 'was'],
    ['لِمَاذَا', 'warum'],
    ['لَوْلَا', 'wenn nicht; warum nicht'],
  ]),
];
