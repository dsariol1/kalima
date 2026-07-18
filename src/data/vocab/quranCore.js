// Quran / Fusha core vocabulary, grouped by triliteral root.
// Individual words + meanings are language facts. Kept from the early prototype.
// Shape is normalised: every entry carries bookId + unit so the picker can group it.
// German (de/unitDe/rootMeaning/example.de) plus English twins (en/unitEn/
// rootMeaningEn/example.en) — the meaning language follows the app language.

export const quranCore = [
  { id: 'q-ktb-1', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ك', 'ت', 'ب'], rootMeaning: 'schreiben', rootMeaningEn: 'to write',
    ar: 'كِتَاب', bare: 'كتاب', translit: 'kitāb', de: 'Buch', en: 'book',
    example: { ar: 'هٰذَا كِتَابٌ جَدِيدٌ', de: 'Dies ist ein neues Buch.', en: 'This is a new book.' } },
  { id: 'q-ktb-2', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ك', 'ت', 'ب'], rootMeaning: 'schreiben', rootMeaningEn: 'to write',
    ar: 'كَاتِب', bare: 'كاتب', translit: 'kātib', de: 'Schreiber, Autor', en: 'writer, author' },
  { id: 'q-ktb-3', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ك', 'ت', 'ب'], rootMeaning: 'schreiben', rootMeaningEn: 'to write',
    ar: 'مَكْتَبَة', bare: 'مكتبة', translit: 'maktaba', de: 'Bibliothek', en: 'library' },

  { id: 'q-alm-1', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ع', 'ل', 'م'], rootMeaning: 'wissen', rootMeaningEn: 'to know',
    ar: 'عِلْم', bare: 'علم', translit: 'ʿilm', de: 'Wissen, Wissenschaft', en: 'knowledge, science',
    example: { ar: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ', de: 'Das Streben nach Wissen ist Pflicht.', en: 'Seeking knowledge is an obligation.' } },
  { id: 'q-alm-2', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ع', 'ل', 'م'], rootMeaning: 'wissen', rootMeaningEn: 'to know',
    ar: 'عَالِم', bare: 'عالم', translit: 'ʿālim', de: 'Gelehrter', en: 'scholar' },
  { id: 'q-alm-3', bookId: 'quran-core', unit: 'roots-1', unitDe: 'Wurzeln I', unitEn: 'Roots I', pos: 'noun',
    root: ['ع', 'ل', 'م'], rootMeaning: 'wissen', rootMeaningEn: 'to know',
    ar: 'مُعَلِّم', bare: 'معلم', translit: 'muʿallim', de: 'Lehrer', en: 'teacher' },

  { id: 'q-qwl-1', bookId: 'quran-core', unit: 'roots-2', unitDe: 'Wurzeln II', unitEn: 'Roots II', pos: 'noun',
    root: ['ق', 'و', 'ل'], rootMeaning: 'sagen', rootMeaningEn: 'to say',
    ar: 'قَوْل', bare: 'قول', translit: 'qawl', de: 'Wort, Aussage', en: 'word, saying' },
  { id: 'q-qwl-2', bookId: 'quran-core', unit: 'roots-2', unitDe: 'Wurzeln II', unitEn: 'Roots II', pos: 'verb',
    root: ['ق', 'و', 'ل'], rootMeaning: 'sagen', rootMeaningEn: 'to say',
    ar: 'قَالَ', bare: 'قال', translit: 'qāla', de: 'er sagte', en: 'he said' },

  { id: 'q-rhm-1', bookId: 'quran-core', unit: 'roots-2', unitDe: 'Wurzeln II', unitEn: 'Roots II', pos: 'noun',
    root: ['ر', 'ح', 'م'], rootMeaning: 'Barmherzigkeit', rootMeaningEn: 'mercy',
    ar: 'رَحْمَة', bare: 'رحمة', translit: 'raḥma', de: 'Barmherzigkeit', en: 'mercy' },
  { id: 'q-rhm-2', bookId: 'quran-core', unit: 'roots-2', unitDe: 'Wurzeln II', unitEn: 'Roots II', pos: 'adj',
    root: ['ر', 'ح', 'م'], rootMeaning: 'Barmherzigkeit', rootMeaningEn: 'mercy',
    ar: 'رَحِيم', bare: 'رحيم', translit: 'raḥīm', de: 'barmherzig', en: 'merciful' },
  { id: 'q-rhm-3', bookId: 'quran-core', unit: 'roots-2', unitDe: 'Wurzeln II', unitEn: 'Roots II', pos: 'noun',
    root: ['ر', 'ح', 'م'], rootMeaning: 'Barmherzigkeit', rootMeaningEn: 'mercy',
    ar: 'رَحْمَٰن', bare: 'رحمن', translit: 'raḥmān', de: 'der Allerbarmer', en: 'the Most Gracious',
    example: { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', de: 'Im Namen Gottes, des Allerbarmers, des Barmherzigen.', en: 'In the name of God, the Most Gracious, the Most Merciful.' } },

  { id: 'q-hmd-1', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['ح', 'م', 'د'], rootMeaning: 'loben', rootMeaningEn: 'to praise',
    ar: 'حَمْد', bare: 'حمد', translit: 'ḥamd', de: 'Lob, Preis', en: 'praise',
    example: { ar: 'الْحَمْدُ لِلَّهِ', de: 'Alles Lob gebührt Gott.', en: 'All praise belongs to God.' } },
  { id: 'q-hmd-2', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'adj',
    root: ['ح', 'م', 'د'], rootMeaning: 'loben', rootMeaningEn: 'to praise',
    ar: 'حَمِيد', bare: 'حميد', translit: 'ḥamīd', de: 'lobenswert, preiswürdig', en: 'praiseworthy' },

  { id: 'q-slm-1', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['س', 'ل', 'م'], rootMeaning: 'Frieden, Hingabe', rootMeaningEn: 'peace, submission',
    ar: 'سَلَام', bare: 'سلام', translit: 'salām', de: 'Frieden', en: 'peace',
    example: { ar: 'السَّلَامُ عَلَيْكُمْ', de: 'Friede sei mit euch.', en: 'Peace be upon you.' } },
  { id: 'q-slm-2', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['س', 'ل', 'م'], rootMeaning: 'Frieden, Hingabe', rootMeaningEn: 'peace, submission',
    ar: 'إِسْلَام', bare: 'اسلام', translit: 'islām', de: 'Hingabe (an Gott), Islam', en: 'submission (to God), Islam' },
  { id: 'q-slm-3', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['س', 'ل', 'م'], rootMeaning: 'Frieden, Hingabe', rootMeaningEn: 'peace, submission',
    ar: 'مُسْلِم', bare: 'مسلم', translit: 'muslim', de: 'der sich Hingebende', en: 'one who submits (Muslim)' },

  { id: 'q-nsr-1', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['ن', 'ص', 'ر'], rootMeaning: 'helfen, siegen', rootMeaningEn: 'to help, to grant victory',
    ar: 'نَصْر', bare: 'نصر', translit: 'naṣr', de: 'Sieg, Hilfe', en: 'victory, help' },
  { id: 'q-nsr-2', bookId: 'quran-core', unit: 'roots-3', unitDe: 'Wurzeln III', unitEn: 'Roots III', pos: 'noun',
    root: ['ن', 'ص', 'ر'], rootMeaning: 'helfen, siegen', rootMeaningEn: 'to help, to grant victory',
    ar: 'نَاصِر', bare: 'ناصر', translit: 'nāṣir', de: 'Helfer', en: 'helper' },
];
