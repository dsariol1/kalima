// "80% der Quran-Wörter" — hochfrequente Quran-Vokabeln, nach Wortart geordnet.
//
// Abgeleitet aus der klassifizierten Wortliste "80% of Qur'anic Words"
// (Dr. Abdulazeez Abdulraheem), aus der eigenen Kopie des Lernenden.
// Übernommen werden NUR die einzelnen Wort→Bedeutung-Paare (Sprachfakten);
// kein Vorwort, keine Erklärtexte, keine Beispielsätze aus der Quelle.
// Bedeutungen in Deutsch UND Englisch, Kapitelnamen eigen formuliert.
// Kapitelnummern vergibt books.js zur Render-Zeit — hier keine Nummern.

const HARAKAT = /[ً-ْٰـ]/g;
const stripHarakat = (s) => s.replace(HARAKAT, '');

// Baut vollständige Vokabel-Einträge aus kompakten [ar, de, en]-Zeilen.
// translit bleibt leer (in der UI nicht mehr genutzt), root null (die Quelle
// gibt keine Wurzeln an — nicht raten).
function unit(id, unitDe, unitEn, rows) {
  return rows.map(([ar, de, en], i) => ({
    id: `q80-${id}-${i + 1}`,
    bookId: 'quran-80',
    unit: id,
    unitDe,
    unitEn,
    pos: 'word',
    ar,
    bare: stripHarakat(ar),
    translit: '',
    de,
    en,
    root: null,
    rootMeaning: null,
  }));
}

export const quran80 = [
  // ---- Demonstrativpronomen (This, that…) ----
  ...unit('demonstr', 'Demonstrativpronomen', 'Demonstratives', [
    ['هَذَا', 'dieser (m)', 'this (m)'],
    ['ذَلِكَ', 'jener (m)', 'that (m)'],
    ['هَذِهِ', 'diese (f)', 'this (f)'],
    ['تِلْكَ', 'jene (f)', 'that (f)'],
    ['هَؤُلَاءِ', 'diese (Pl.)', 'these (pl.)'],
    ['أُولَئِكَ', 'jene (Pl.)', 'those (pl.)'],
    ['الَّذِي', 'derjenige, der (m)', 'the one who (m)'],
    ['الَّتِي', 'diejenige, die (f)', 'the one who (f)'],
    ['الَّذِينَ', 'diejenigen, die (Pl.)', 'those who (pl.)'],
  ]),

  // ---- Verneinung (No, No!) ----
  ...unit('negation', 'Verneinung', 'Negation', [
    ['لَا', 'nein; nicht', 'no; not'],
    ['إِلَّا', 'außer; wenn nicht', 'except; unless'],
    ['كَلَّا', 'keineswegs; gewiss nicht', 'by no means; certainly not'],
    ['لَنْ', 'nicht (Zukunft: wird nicht)', 'will not (future)'],
    ['لَمْ', 'nicht (Vergangenheit: hat nicht)', 'did not (past)'],
    ['مَا', 'nicht', 'not'],
    ['لَيْسَ', 'ist nicht; nicht sein', 'is not; to not be'],
    ['بَلَى', 'doch (ja, nach Verneinung)', 'yes indeed (after a negative)'],
    ['غَيْر', 'nicht; anders als; außer', 'not; other than; except'],
    ['دُونَ', 'außer; unterhalb; geringer als', 'besides; below; less than'],
    ['نَعَمْ', 'ja', 'yes'],
  ]),

  // ---- Personalpronomen (Who?) ----
  ...unit('personal', 'Personalpronomen', 'Personal pronouns', [
    ['هُوَ', 'er', 'he'],
    ['هُمْ', 'sie (m, Pl.)', 'they (m, pl.)'],
    ['أَنْتَ', 'du (m)', 'you (m)'],
    ['أَنْتُمْ', 'ihr (m, Pl.)', 'you (m, pl.)'],
    ['أَنَا', 'ich', 'I'],
    ['نَحْنُ', 'wir', 'we'],
    ['هِيَ', 'sie (f)', 'she'],
    ['هُنَّ', 'sie (f, Pl.)', 'they (f, pl.)'],
    ['أَنْتِ', 'du (f)', 'you (f)'],
    ['هُمَا', 'sie beide (Dual)', 'they two (dual)'],
    ['أَنْتُمَا', 'ihr beide (Dual)', 'you two (dual)'],
  ]),

  // ---- Possessivsuffixe (Whose?) ----
  ...unit('possessiv', 'Possessivsuffixe', 'Possessive suffixes', [
    ['ـهُ', 'sein (m)', 'his (m)'],
    ['ـهُمْ', 'ihr (m, Pl.)', 'their (m, pl.)'],
    ['ـكَ', 'dein (m)', 'your (m)'],
    ['ـكُمْ', 'euer (m, Pl.)', 'your (m, pl.)'],
    ['ـِي', 'mein; mich', 'my; me'],
    ['ـنَا', 'unser; uns', 'our; us'],
    ['ـهَا', 'ihr (f)', 'her (f)'],
    ['ـهُنَّ', 'ihr (f, Pl.)', 'their (f, pl.)'],
    ['ـكِ', 'dein (f)', 'your (f)'],
  ]),

  // ---- Ortswörter (Where?) ----
  ...unit('ort', 'Ortswörter', 'Place words', [
    ['فَوْقَ', 'über; oben', 'above; over'],
    ['تَحْتَ', 'unter', 'under'],
    ['بَيْنَ يَدَيْ', 'vor (wörtl. „zwischen den Händen von")', 'before (lit. "between the hands of")'],
    ['خَلْفَ', 'hinter; nach', 'behind; after'],
    ['أَمَامَ', 'vor', 'in front of'],
    ['وَرَاءَ', 'hinter', 'behind'],
    ['يَمِين', 'rechts; Schwur', 'right (side); oath'],
    ['شِمَال', 'links', 'left (side)'],
    ['بَيْنَ', 'zwischen', 'between'],
    ['حَوْلَ', 'um … herum', 'around'],
    ['حَيْثُ', 'wo; da wo', 'where; wherever'],
    ['أَيْنَمَا', 'wo auch immer', 'wherever'],
  ]),

  // ---- Fragewörter (Questions) ----
  ...unit('frage', 'Fragewörter', 'Question words', [
    ['مَا', 'was', 'what'],
    ['مَنْ', 'wer', 'who'],
    ['مَتَى', 'wann', 'when'],
    ['أَيْنَ', 'wo', 'where'],
    ['كَيْفَ', 'wie', 'how'],
    ['كَمْ', 'wie viel(e)', 'how much/many'],
    ['أَيّ', 'welcher', 'which'],
    ['أَنَّى', 'woher; wie', 'from where; how'],
    ['هَلْ', 'ob …? (Fragepartikel)', 'is/do …? (question particle)'],
    ['مَاذَا', 'was', 'what'],
    ['لِمَاذَا', 'warum', 'why'],
    ['لَوْلَا', 'wenn nicht; warum nicht', 'if not; why not'],
  ]),

  // ==== Etappe 2 (Seiten 4–6 der Quelle) ====

  // ---- Zeitangaben (When?) ----
  ...unit('zeit', 'Zeitangaben', 'Time words', [
    ['قَبْلَ', 'vor (zeitlich)', 'before (in time)'],
    ['بَعْدَ', 'nach (zeitlich)', 'after (in time)'],
    ['حِين', 'Zeit, Zeitpunkt; zur Zeit von', 'time, moment; at the time of'],
    ['إِذْ', 'als (Vergangenheit)', 'when (past)'],
    ['إِذَا', 'wenn (Zukunft)', 'when, if (future)'],
    ['ثُمَّ', 'dann; danach', 'then; afterwards'],
    ['فَ', 'dann; also, deshalb', 'then; so, therefore'],
    ['بَلْ', 'nein, vielmehr; sondern; jedoch', 'rather; but; however'],
    ['عِنْدَ', 'bei; nahe (auch لَدَى)', 'at; near (also لَدَى)'],
    ['إِنْ … إِلَّا', 'nichts … außer', 'nothing … except'],
    ['مَا … إِلَّا', 'nichts … außer', 'nothing … except'],
    ['أَلَّا', 'dass … nicht; damit nicht (أَنْ + لَا)', 'that … not; lest (أَنْ + لَا)'],
  ]),

  // ---- Verschiedenes (Miscellaneous) ----
  ...unit('verschiedenes', 'Verschiedenes', 'Miscellaneous', [
    ['ذُو', 'Besitzer von; versehen mit (m) (auch ذَا، ذِي)', 'possessor of; endowed with (m) (also ذَا، ذِي)'],
    ['ذَات', 'Besitzerin von; versehen mit (f)', 'possessor of; endowed with (f)'],
    ['أُولُو', 'Leute von; Besitzer von (auch أُولِي)', 'people of; possessors of (also أُولِي)'],
    ['أَهْل', 'Leute von; Angehörige', 'people of; family'],
    ['آل', 'Familie, Angehörige, Leute', 'family, kin, people'],
    ['أَلَا', 'wohlan!; nicht etwa …?', 'behold!; is it not …?'],
    ['نِعْمَ', 'wie vortrefflich ist …', 'how excellent is …'],
    ['بِئْسَ', 'wie schlecht ist …', 'how bad is …'],
    ['بِئْسَمَا', 'schlecht ist das, was …', 'bad is that which …'],
    ['مِثْل', 'etwas Ähnliches; gleich wie', 'the like of; similar to'],
    ['مَثَل', 'Gleichnis (Pl. أَمْثَال)', 'parable, example (pl. أَمْثَال)'],
    ['مِمَّنْ', 'von denen, die; von wem (مِنْ + مَنْ)', 'of those who; from whom (مِنْ + مَنْ)'],
  ]),

  // ---- Häufige Präpositionen (Prepositions) ----
  // Nicht exakt "Präpositionen" benannt, damit das Kapitel in der
  // Buchreihenfolge nummeriert bleibt (books.js sortiert exakt so benannte
  // Kapitel ans Ende).
  ...unit('praep', 'Häufige Präpositionen', 'Common prepositions', [
    ['بِ', 'mit, in, durch …', 'with, in, by …'],
    ['عَنْ', 'über; von', 'about; from'],
    ['فِي', 'in', 'in'],
    ['كَ', 'wie, als', 'like, as'],
    ['لِ', 'für (auch لَ)', 'for (also لَ)'],
    ['مِنْ', 'von, aus', 'from, of'],
    ['إِلَى', 'zu, nach … hin', 'to, towards'],
    ['تَ', 'bei (Schwurpartikel)', 'by (oath particle)'],
    ['حَتَّى', 'bis', 'until'],
    ['عَلَى', 'auf', 'on, upon'],
    ['مَعَ', 'mit', 'with'],
    ['وَ', 'und; bei (Schwurpartikel)', 'and; by (oath particle)'],
  ]),

  // ---- Präpositionen mit مَا (Prepositions + مَا) ----
  ...unit('praep-ma', 'Präpositionen mit مَا', 'Prepositions with مَا', [
    ['بِمَا', 'womit; weil', 'with what; because'],
    ['عَمَّا', 'worüber; wovon', 'about what; from what'],
    ['فِيمَا', 'worin', 'in what'],
    ['كَمَا', 'so wie, ebenso wie', 'just as, likewise'],
    ['لِمَا', 'wofür; für das, was', 'for what; for that which'],
    ['مِمَّا', 'woraus; von dem, was', 'from what; of that which'],
    ['أَمَّا', 'was … betrifft', 'as for …'],
    ['إِمَّا', 'entweder … oder; wenn', 'either … or; if'],
    ['أَنَّمَا', 'dass', 'that'],
    ['إِنَّمَا', 'wahrlich; nichts als', 'truly; nothing but'],
    ['كَأَنَّمَا', 'als ob', 'as if'],
    ['كُلَّمَا', 'immer wenn; jedes Mal wenn', 'whenever; each time that'],
  ]),

  // ---- Verbpräfixe (Prefix for verb…) ----
  ...unit('verbpraefix', 'Verbpräfixe', 'Verb prefixes', [
    ['قَدْ', 'bereits (Vergangenheit); gewiss (Gegenwart)', 'already (past); indeed (present)'],
    ['سَ', 'wird (nahe Zukunft)', 'will (near future)'],
    ['سَوْفَ', 'wird (Zukunft)', 'will (future)'],
    ['لَ … نَّ', 'wird gewiss (لَ + Verb + نَّ)', 'will certainly (لَ + verb + نَّ)'],
    ['لَقَدْ', 'wahrlich, gewiss', 'indeed, certainly'],
    ['لَ', 'wahrlich, gewiss', 'truly, indeed'],
    ['لِ', 'lass … tun (Imperativpartikel, auch لْ)', 'let … do (imperative particle, also لْ)'],
    ['أَل', 'der/die/das (Artikel)', 'the (definite article)'],
    ['أَمْ', 'oder? (in Fragen)', 'or? (in questions)'],
    ['أَوْ', 'oder', 'or'],
    ['بَعْض', 'einige von; ein Teil von', 'some of; part of'],
    ['كُلّ', 'alle; jeder; ganz', 'all; every; whole'],
  ]),

  // ---- Inna-Gruppe (Inna) ----
  ...unit('inna', 'Inna-Gruppe', 'The inna group', [
    ['إِنَّ', 'wahrlich, gewiss', 'truly, indeed'],
    ['أَنَّ', 'dass', 'that'],
    ['كَأَنَّ', 'als ob', 'as if'],
    ['لَكِنَّ', 'aber, jedoch (auch لَكِنْ)', 'but, however (also لَكِنْ)'],
    ['لَعَلَّ', 'vielleicht; möge', 'perhaps; may'],
    ['أَنْ', 'dass', 'that (to)'],
    ['إِنْ', 'wenn, falls', 'if'],
    ['إِيَّا', 'allein (nur mit Suffix)', 'alone (only with a suffix)'],
    ['عَسَى', 'möglicherweise; vielleicht', 'perhaps; it may be'],
    ['لَمَّا', 'als; sobald', 'when; as soon as'],
    ['لَوْ', 'wenn (irreal)', 'if (hypothetical)'],
    ['يَا أَيُّهَا', 'o! (Anrede)', 'O! (form of address)'],
  ]),
];
