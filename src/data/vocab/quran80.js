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

  // ==== Etappe 2 (Seiten 4–6 der Quelle) ====

  // ---- Zeitangaben (When?) ----
  ...unit('zeit', 'Zeitangaben', [
    ['قَبْلَ', 'vor (zeitlich)'],
    ['بَعْدَ', 'nach (zeitlich)'],
    ['حِين', 'Zeit, Zeitpunkt; zur Zeit von'],
    ['إِذْ', 'als (Vergangenheit)'],
    ['إِذَا', 'wenn (Zukunft)'],
    ['ثُمَّ', 'dann; danach'],
    ['فَ', 'dann; also, deshalb'],
    ['بَلْ', 'nein, vielmehr; sondern; jedoch'],
    ['عِنْدَ', 'bei; nahe (auch لَدَى)'],
    ['إِنْ … إِلَّا', 'nichts … außer'],
    ['مَا … إِلَّا', 'nichts … außer'],
    ['أَلَّا', 'dass … nicht; damit nicht (أَنْ + لَا)'],
  ]),

  // ---- Verschiedenes (Miscellaneous) ----
  ...unit('verschiedenes', 'Verschiedenes', [
    ['ذُو', 'Besitzer von; versehen mit (m) (auch ذَا، ذِي)'],
    ['ذَات', 'Besitzerin von; versehen mit (f)'],
    ['أُولُو', 'Leute von; Besitzer von (auch أُولِي)'],
    ['أَهْل', 'Leute von; Angehörige'],
    ['آل', 'Familie, Angehörige, Leute'],
    ['أَلَا', 'wohlan!; nicht etwa …?'],
    ['نِعْمَ', 'wie vortrefflich ist …'],
    ['بِئْسَ', 'wie schlecht ist …'],
    ['بِئْسَمَا', 'schlecht ist das, was …'],
    ['مِثْل', 'etwas Ähnliches; gleich wie'],
    ['مَثَل', 'Gleichnis (Pl. أَمْثَال)'],
    ['مِمَّنْ', 'von denen, die; von wem (مِنْ + مَنْ)'],
  ]),

  // ---- Häufige Präpositionen (Prepositions) ----
  // Nicht exakt "Präpositionen" benannt, damit das Kapitel in der
  // Buchreihenfolge nummeriert bleibt (books.js sortiert exakt so benannte
  // Kapitel ans Ende).
  ...unit('praep', 'Häufige Präpositionen', [
    ['بِ', 'mit, in, durch …'],
    ['عَنْ', 'über; von'],
    ['فِي', 'in'],
    ['كَ', 'wie, als'],
    ['لِ', 'für (auch لَ)'],
    ['مِنْ', 'von, aus'],
    ['إِلَى', 'zu, nach … hin'],
    ['تَ', 'bei (Schwurpartikel)'],
    ['حَتَّى', 'bis'],
    ['عَلَى', 'auf'],
    ['مَعَ', 'mit'],
    ['وَ', 'und; bei (Schwurpartikel)'],
  ]),

  // ---- Präpositionen mit مَا (Prepositions + مَا) ----
  ...unit('praep-ma', 'Präpositionen mit مَا', [
    ['بِمَا', 'womit; weil'],
    ['عَمَّا', 'worüber; wovon'],
    ['فِيمَا', 'worin'],
    ['كَمَا', 'so wie, ebenso wie'],
    ['لِمَا', 'wofür; für das, was'],
    ['مِمَّا', 'woraus; von dem, was'],
    ['أَمَّا', 'was … betrifft'],
    ['إِمَّا', 'entweder … oder; wenn'],
    ['أَنَّمَا', 'dass'],
    ['إِنَّمَا', 'wahrlich; nichts als'],
    ['كَأَنَّمَا', 'als ob'],
    ['كُلَّمَا', 'immer wenn; jedes Mal wenn'],
  ]),

  // ---- Verbpräfixe (Prefix for verb…) ----
  ...unit('verbpraefix', 'Verbpräfixe', [
    ['قَدْ', 'bereits (Vergangenheit); gewiss (Gegenwart)'],
    ['سَ', 'wird (nahe Zukunft)'],
    ['سَوْفَ', 'wird (Zukunft)'],
    ['لَ … نَّ', 'wird gewiss (لَ + Verb + نَّ)'],
    ['لَقَدْ', 'wahrlich, gewiss'],
    ['لَ', 'wahrlich, gewiss'],
    ['لِ', 'lass … tun (Imperativpartikel, auch لْ)'],
    ['أَل', 'der/die/das (Artikel)'],
    ['أَمْ', 'oder? (in Fragen)'],
    ['أَوْ', 'oder'],
    ['بَعْض', 'einige von; ein Teil von'],
    ['كُلّ', 'alle; jeder; ganz'],
  ]),

  // ---- Inna-Gruppe (Inna) ----
  ...unit('inna', 'Inna-Gruppe', [
    ['إِنَّ', 'wahrlich, gewiss'],
    ['أَنَّ', 'dass'],
    ['كَأَنَّ', 'als ob'],
    ['لَكِنَّ', 'aber, jedoch (auch لَكِنْ)'],
    ['لَعَلَّ', 'vielleicht; möge'],
    ['أَنْ', 'dass'],
    ['إِنْ', 'wenn, falls'],
    ['إِيَّا', 'allein (nur mit Suffix)'],
    ['عَسَى', 'möglicherweise; vielleicht'],
    ['لَمَّا', 'als; sobald'],
    ['لَوْ', 'wenn (irreal)'],
    ['يَا أَيُّهَا', 'o! (Anrede)'],
  ]),
];
