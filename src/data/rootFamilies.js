// Wortfamilien für den Wurzel-Explorer-Prototyp (RootExplorer.jsx).
// Vier Wurzeln, alle mit Wörtern, die auch im echten ABY-Grundwortschatz
// vorkommen (Verankerung — siehe KNOWN_BY_BARE in RootExplorer.jsx).
//
// `patternMeaning` wird zentral aus PATTERN_MEANINGS aufgelöst: dieselbe
// Formulierung taucht bei jeder Wurzel für dasselbe Muster auf — genau diese
// Wiederholung soll das Muster über mehrere Wortfamilien hinweg verankern
// (Ziel: Nutzer erkennt "مَفْعَل = Ort" wieder, statt es elf Mal neu zu lernen).
//
// Zweisprachig: neben den deutschen Feldern (de, rootMeaning, patternMeaning,
// type, example.de, parallels[].de) trägt jeder Eintrag englische Zwillinge
// (en, rootMeaningEn, patternMeaningEn, typeEn, example.en, parallels[].en).

const HARAKAT = /[ً-ْٰـ]/g;
const stripHarakat = (s) => s.replace(HARAKAT, '');
const wordText = (segments) => segments.map((s) => s.t).join('');

// Verankerung/Matching gegen echte Vokabeldaten braucht mehr Präzision als
// volles Harakat-Strippen: مَدْرَسَة "Schule" und مُدَرِّسَة "Lehrerin" teilen
// denselben bare-Text ("مدرسة"), sind aber verschiedene Wörter. Nur die
// auslautende Fallvokal-Endung entfernen (z.B. يَكْتُبُ vs. im Buch zitiertes
// يَكْتُب) erhält interne Diakritika, die solche Homographe unterscheiden.
const TRAILING_HARAKAT = /[ًٌٍَُِّْ]+$/;
export const normalizeCitation = (ar) => ar.replace(TRAILING_HARAKAT, '');

const PATTERN_MEANINGS = {
  'فَعَلَ': 'Grundstamm, Perfekt — die reine Handlung in der Vergangenheit, ohne Zusatzbedeutung.',
  'فَعِلَ': 'Grundstamm, Perfekt (Kasra-Typ) — meist Zustände oder Empfindungen; gleiche Funktion wie فَعَلَ.',
  'فَعَّلَ': 'Form II, Perfekt — oft verstärkend oder kausativ: "bewirken, dass etwas geschieht".',
  'يَفْعُلُ': 'Grundstamm, Präsens/Zukunft (u-Typ) — يَـ vorne markiert die 3. Person männlich.',
  'يَفْعَلُ': 'Grundstamm, Präsens/Zukunft (a-Typ) — يَـ vorne markiert die 3. Person männlich; der Mittelvokal hängt vom Verb ab.',
  'يُفَعِّلُ': 'Form II, Präsens — verstärkend/kausativ, يُـ vorne markiert die 3. Person männlich.',
  'فِعَال': 'Häufiges Nomen-Muster für konkrete Dinge — oft das greifbare Ergebnis einer Handlung.',
  'فَعَل': 'Einfaches Nomen-Muster — oft die Handlung oder ihr Ergebnis als schlichtes Ding.',
  'فَاعِل': 'Aktives Partizip — "der/die, der/die etwas tut". Eines der wichtigsten Muster überhaupt.',
  'فَاعِلَة': 'Aktives Partizip, feminin — "die, die etwas tut".',
  'فُعَّال': 'Gebrochener Plural zu فَاعِل — die Gruppe derer, die etwas tun.',
  'مَفْعَل': 'مَـ vorne = Ortsangabe. "Der Ort, an dem die Handlung stattfindet."',
  'مَفْعَلَة': 'مَـ...ة = Ort mit vielen X, oft ein Sammelort für die Handlung.',
  'مَفْعُول': 'Passives Partizip — "das, was getan wurde". Das Objekt der Handlung.',
  'فِعَالَة': 'Verbalnomen (Maṣdar) — die Handlung selbst, als abstraktes Ding betrachtet.',
  'فُعُول': 'Verbalnomen-Muster — beschreibt oft einen Zustand oder Vorgang als Ganzes.',
  'فَعِيلَة': 'Eigenschafts-Nomen — beschreibt eine innere Qualität oder einen Zustand.',
  'فُعَيْعِل': 'Verkleinerungsform (Diminutiv) — drückt Kleinheit oder Zuneigung aus.',
  'مُفَاعَلَة': 'Verbalnomen der Form III — drückt oft Gegenseitigkeit zwischen zwei Parteien aus.',
  'اِفْتَعَلَ': 'Form VIII — oft reflexive Bedeutung: die Handlung an sich selbst vollziehen.',
  'اِسْتِفْعَال': 'Verbalnomen der Form X — oft "etwas verlangen" oder "etwas verwenden/betrachten als".',
  'مُفَعِّل': 'Aktives Partizip der Form II — "wer etwas verstärkt, bewirkt oder lehrt".',
  'مُفَعِّلَة': 'Aktives Partizip der Form II, feminin.',
};

const PATTERN_MEANINGS_EN = {
  'فَعَلَ': 'Base stem, perfect — the plain action in the past, with no added meaning.',
  'فَعِلَ': 'Base stem, perfect (kasra type) — usually states or feelings; same function as فَعَلَ.',
  'فَعَّلَ': 'Form II, perfect — often intensive or causative: "to make something happen".',
  'يَفْعُلُ': 'Base stem, present/future (u-type) — the يَـ prefix marks the 3rd person masculine.',
  'يَفْعَلُ': 'Base stem, present/future (a-type) — the يَـ prefix marks the 3rd person masculine; the middle vowel depends on the verb.',
  'يُفَعِّلُ': 'Form II, present — intensive/causative, the يُـ prefix marks the 3rd person masculine.',
  'فِعَال': 'A common noun pattern for concrete things — often the tangible result of an action.',
  'فَعَل': 'A simple noun pattern — often the action or its result as a plain thing.',
  'فَاعِل': 'Active participle — "the one who does something". One of the most important patterns of all.',
  'فَاعِلَة': 'Active participle, feminine — "the one (f) who does something".',
  'فُعَّال': 'Broken plural of فَاعِل — the group of those who do something.',
  'مَفْعَل': 'The مَـ prefix marks a place. "The place where the action happens."',
  'مَفْعَلَة': 'مَـ...ة = a place with many X, often a gathering spot for the action.',
  'مَفْعُول': 'Passive participle — "that which was done". The object of the action.',
  'فِعَالَة': 'Verbal noun (maṣdar) — the action itself, seen as an abstract thing.',
  'فُعُول': 'Verbal-noun pattern — often describes a state or process as a whole.',
  'فَعِيلَة': 'Quality noun — describes an inner quality or a state.',
  'فُعَيْعِل': 'Diminutive form — expresses smallness or affection.',
  'مُفَاعَلَة': 'Verbal noun of Form III — often expresses reciprocity between two parties.',
  'اِفْتَعَلَ': 'Form VIII — often reflexive: to perform the action upon oneself.',
  'اِسْتِفْعَال': 'Verbal noun of Form X — often "to request something" or "to use/regard as".',
  'مُفَعِّل': 'Active participle of Form II — "the one who intensifies, causes or teaches".',
  'مُفَعِّلَة': 'Active participle of Form II, feminine.',
};

function family(root, rootMeaning, rootMeaningEn, defaultCenterId, words) {
  return {
    root: root.split(''),
    rootMeaning,
    rootMeaningEn,
    defaultCenterId,
    words: words.map((w) => ({
      ...w,
      ar: wordText(w.segments),
      bare: stripHarakat(wordText(w.segments)),
      patternMeaning: PATTERN_MEANINGS[w.pattern],
      patternMeaningEn: PATTERN_MEANINGS_EN[w.pattern],
    })),
  };
}

const R = (t) => ({ t, root: true });
const P = (t) => ({ t, root: false });

export const ROOT_FAMILIES = {
  // ---- ك ت ب — schreiben ----
  'كتب': family('كتب', 'schreiben', 'to write', 'kitab', [
    { id: 'kataba', de: 'er schrieb', en: 'he wrote', type: 'Verb (Perfekt)', typeEn: 'Verb (perfect)', frequency: 4, relation: 'Handlung',
      segments: [R('كَ'), R('تَ'), R('بَ')], pattern: 'فَعَلَ',
      parallels: [{ ar: 'ذَهَبَ', de: 'er ging', en: 'he went' }, { ar: 'فَتَحَ', de: 'er öffnete', en: 'he opened' }, { ar: 'جَلَسَ', de: 'er sass', en: 'he sat' }],
      example: { ar: 'كَتَبَ رِسَالَةً', de: 'Er schrieb einen Brief.', en: 'He wrote a letter.' } },
    { id: 'yaktubu', de: 'er schreibt', en: 'he writes', type: 'Verb (Präsens)', typeEn: 'Verb (present)', frequency: 5, relation: 'Handlung',
      segments: [P('يَ'), R('كْ'), R('تُ'), R('بُ')], pattern: 'يَفْعُلُ',
      parallels: [{ ar: 'يَدْخُلُ', de: 'er tritt ein', en: 'he enters' }, { ar: 'يَنْظُرُ', de: 'er schaut', en: 'he looks' }, { ar: 'يَخْرُجُ', de: 'er geht hinaus', en: 'he goes out' }],
      example: { ar: 'يَكْتُبُ الدَّرْسَ', de: 'Er schreibt die Lektion.', en: 'He writes the lesson.' } },
    { id: 'kitab', de: 'Buch', en: 'book', type: 'Nomen', typeEn: 'Noun', frequency: 5, relation: 'Ergebnis',
      segments: [R('كِ'), R('تَ'), P('ا'), R('ب')], pattern: 'فِعَال',
      parallels: [{ ar: 'لِبَاس', de: 'Kleidung', en: 'clothing' }, { ar: 'جِدَار', de: 'Wand', en: 'wall' }, { ar: 'حِزَام', de: 'Gürtel', en: 'belt' }],
      example: { ar: 'الْكِتَابُ عَلَى الطَّاوِلَةِ', de: 'Das Buch ist auf dem Tisch.', en: 'The book is on the table.' } },
    { id: 'katib', de: 'Schreiber, Autor', en: 'writer, author', type: 'Partizip Aktiv', typeEn: 'Active participle', frequency: 4, relation: 'Person',
      segments: [R('كَ'), P('ا'), R('تِ'), R('ب')], pattern: 'فَاعِل',
      parallels: [{ ar: 'طَالِب', de: 'Student', en: 'student' }, { ar: 'عَامِل', de: 'Arbeiter', en: 'worker' }, { ar: 'سَاكِن', de: 'Bewohner', en: 'resident' }],
      example: { ar: 'هُوَ كَاتِبٌ مَشْهُور', de: 'Er ist ein bekannter Autor.', en: 'He is a well-known author.' } },
    { id: 'maktab', de: 'Büro, Schreibtisch', en: 'office, desk', type: 'Ortsnomen', typeEn: 'Noun of place', frequency: 4, relation: 'Ort',
      segments: [P('مَ'), R('كْ'), R('تَ'), R('ب')], pattern: 'مَفْعَل',
      parallels: [{ ar: 'مَطْبَخ', de: 'Küche', en: 'kitchen' }, { ar: 'مَلْعَب', de: 'Spielplatz', en: 'playground' }, { ar: 'مَسْجِد', de: 'Moschee', en: 'mosque' }],
      example: { ar: 'أَعْمَلُ فِي الْمَكْتَبِ', de: 'Ich arbeite im Büro.', en: 'I work in the office.' } },
    { id: 'maktaba', de: 'Bibliothek', en: 'library', type: 'Ortsnomen', typeEn: 'Noun of place', frequency: 4, relation: 'Ort',
      segments: [P('مَ'), R('كْ'), R('تَ'), R('بَ'), P('ة')], pattern: 'مَفْعَلَة',
      parallels: [{ ar: 'مَدْرَسَة', de: 'Schule', en: 'school' }, { ar: 'مَزْرَعَة', de: 'Farm', en: 'farm' }, { ar: 'مَقْبَرَة', de: 'Friedhof', en: 'cemetery' }],
      example: { ar: 'الْمَكْتَبَةُ مَفْتُوحَة', de: 'Die Bibliothek ist geöffnet.', en: 'The library is open.' } },
    { id: 'maktub', de: 'geschrieben', en: 'written', type: 'Partizip Passiv', typeEn: 'Passive participle', frequency: 3, relation: 'Ergebnis',
      segments: [P('مَ'), R('كْ'), R('تُ'), P('و'), R('ب')], pattern: 'مَفْعُول',
      parallels: [{ ar: 'مَفْتُوح', de: 'geöffnet', en: 'opened' }, { ar: 'مَعْرُوف', de: 'bekannt', en: 'well-known' }, { ar: 'مَشْغُول', de: 'beschäftigt', en: 'busy' }],
      example: { ar: 'الِاسْمُ مَكْتُوبٌ هُنَا', de: 'Der Name ist hier geschrieben.', en: 'The name is written here.' } },
    { id: 'kitaba', de: 'das Schreiben', en: 'writing (the act)', type: 'Verbalnomen', typeEn: 'Verbal noun', frequency: 3, relation: 'Handlung',
      segments: [R('كِ'), R('تَ'), P('ا'), R('بَ'), P('ة')], pattern: 'فِعَالَة',
      parallels: [{ ar: 'قِرَاءَة', de: 'das Lesen', en: 'reading' }, { ar: 'زِرَاعَة', de: 'Landwirtschaft', en: 'agriculture' }, { ar: 'سِبَاحَة', de: 'Schwimmen', en: 'swimming' }],
      example: { ar: 'أَتَعَلَّمُ الْكِتَابَةَ', de: 'Ich lerne das Schreiben.', en: 'I am learning writing.' } },
    { id: 'kutayyib', de: 'Büchlein, Broschüre', en: 'booklet, brochure', type: 'Diminutiv', typeEn: 'Diminutive', frequency: 2, relation: 'Ergebnis',
      segments: [R('كُ'), R('تَ'), P('يِّ'), R('ب')], pattern: 'فُعَيْعِل',
      parallels: [{ ar: 'كُلَيْب', de: 'Hündchen', en: 'little dog' }, { ar: 'بُيَيْت', de: 'Häuschen', en: 'little house' }, { ar: 'وُلَيْد', de: 'kleiner Junge', en: 'little boy' }],
      example: { ar: 'قَرَأْتُ كُتَيِّبًا صَغِيرًا', de: 'Ich las eine kleine Broschüre.', en: 'I read a small booklet.' } },
    { id: 'mukataba', de: 'Korrespondenz', en: 'correspondence', type: 'Verbalnomen (Form III)', typeEn: 'Verbal noun (Form III)', frequency: 1, relation: 'Handlung',
      segments: [P('مُ'), R('كَ'), P('ا'), R('تَ'), R('بَ'), P('ة')], pattern: 'مُفَاعَلَة',
      parallels: [{ ar: 'مُشَاهَدَة', de: 'das Betrachten', en: 'watching' }, { ar: 'مُسَاعَدَة', de: 'Hilfe', en: 'help' }, { ar: 'مُقَابَلَة', de: 'Begegnung', en: 'meeting' }],
      example: { ar: 'بَيْنَهُمَا مُكَاتَبَةٌ طَوِيلَة', de: 'Zwischen ihnen besteht eine lange Korrespondenz.', en: 'There is a long correspondence between them.' } },
    { id: 'iktataba', de: 'sich einschreiben', en: 'to enroll, sign up', type: 'Verb (Form VIII)', typeEn: 'Verb (Form VIII)', frequency: 1, relation: 'Handlung',
      segments: [P('اِ'), R('كْ'), P('تَ'), R('تَ'), R('بَ')], pattern: 'اِفْتَعَلَ',
      parallels: [{ ar: 'اِجْتَمَعَ', de: 'sich versammeln', en: 'to gather' }, { ar: 'اِنْتَظَرَ', de: 'warten', en: 'to wait' }, { ar: 'اِشْتَغَلَ', de: 'beschäftigt sein', en: 'to be occupied' }],
      example: { ar: 'اِكْتَتَبَ فِي الدَّوْرَةِ', de: 'Er schrieb sich für den Kurs ein.', en: 'He enrolled in the course.' } },
  ]),

  // ---- د ر س — lernen, studieren ----
  'درس': family('درس', 'lernen, studieren', 'to learn, to study', 'madrasa', [
    { id: 'darasa', de: 'er lernte, studierte', en: 'he learned, studied', type: 'Verb (Perfekt)', typeEn: 'Verb (perfect)', frequency: 4, relation: 'Handlung',
      segments: [R('دَ'), R('رَ'), R('سَ')], pattern: 'فَعَلَ',
      parallels: [{ ar: 'كَتَبَ', de: 'er schrieb', en: 'he wrote' }, { ar: 'عَمِلَ', de: 'er tat', en: 'he did' }, { ar: 'سَكَنَ', de: 'er wohnte', en: 'he lived' }],
      example: { ar: 'دَرَسَ اللُّغَةَ الْعَرَبِيَّةَ', de: 'Er lernte die arabische Sprache.', en: 'He studied the Arabic language.' } },
    { id: 'yadrusu', de: 'er lernt, studiert', en: 'he learns, studies', type: 'Verb (Präsens)', typeEn: 'Verb (present)', frequency: 5, relation: 'Handlung',
      segments: [P('يَ'), R('دْ'), R('رُ'), R('سُ')], pattern: 'يَفْعُلُ',
      parallels: [{ ar: 'يَكْتُبُ', de: 'er schreibt', en: 'he writes' }, { ar: 'يَسْكُنُ', de: 'er wohnt', en: 'he lives' }, { ar: 'يَعْمَلُ', de: 'er arbeitet', en: 'he works' }],
      example: { ar: 'يَدْرُسُ فِي الْمَكْتَبَةِ', de: 'Er lernt in der Bibliothek.', en: 'He studies in the library.' } },
    { id: 'dars', de: 'Lektion, Unterricht', en: 'lesson, class', type: 'Nomen', typeEn: 'Noun', frequency: 4, relation: 'Ergebnis',
      segments: [R('دَ'), R('رْ'), R('س')], pattern: 'فَعَل',
      parallels: [{ ar: 'عَمَل', de: 'Arbeit', en: 'work' }, { ar: 'سَكَن', de: 'Wohnsitz', en: 'dwelling' }, { ar: 'قَوْل', de: 'Wort, Aussage', en: 'word, saying' }],
      example: { ar: 'الدَّرْسُ صَعْبٌ الْيَوْمَ', de: 'Die Lektion ist heute schwer.', en: 'The lesson is hard today.' } },
    { id: 'mudarris', de: 'Lehrer', en: 'teacher', type: 'Partizip Aktiv (Form II)', typeEn: 'Active participle (Form II)', frequency: 5, relation: 'Person',
      segments: [P('مُ'), R('دَ'), R('رِّ'), R('س')], pattern: 'مُفَعِّل',
      parallels: [{ ar: 'مُعَلِّم', de: 'Lehrer', en: 'teacher' }, { ar: 'مُنَظِّم', de: 'Organisator', en: 'organizer' }, { ar: 'مُرَتِّب', de: 'jemand, der ordnet', en: 'one who arranges' }],
      example: { ar: 'الْمُدَرِّسُ فِي الصَّفِّ', de: 'Der Lehrer ist im Klassenzimmer.', en: 'The teacher is in the classroom.' } },
    { id: 'mudarrisa', de: 'Lehrerin', en: 'teacher (f)', type: 'Partizip Aktiv (Form II), fem.', typeEn: 'Active participle (Form II), fem.', frequency: 4, relation: 'Person',
      segments: [P('مُ'), R('دَ'), R('رِّ'), R('سَ'), P('ة')], pattern: 'مُفَعِّلَة',
      parallels: [{ ar: 'مُعَلِّمَة', de: 'Lehrerin', en: 'teacher (f)' }, { ar: 'مُمَرِّضَة', de: 'Krankenschwester', en: 'nurse' }, { ar: 'مُنَظِّمَة', de: 'Organisatorin', en: 'organizer (f)' }],
      example: { ar: 'الْمُدَرِّسَةُ لَطِيفَة', de: 'Die Lehrerin ist freundlich.', en: 'The teacher (f) is kind.' } },
    { id: 'madrasa', de: 'Schule', en: 'school', type: 'Ortsnomen', typeEn: 'Noun of place', frequency: 5, relation: 'Ort',
      segments: [P('مَ'), R('دْ'), R('رَ'), R('سَ'), P('ة')], pattern: 'مَفْعَلَة',
      parallels: [{ ar: 'مَكْتَبَة', de: 'Bibliothek', en: 'library' }, { ar: 'مَزْرَعَة', de: 'Farm', en: 'farm' }, { ar: 'مَلْعَب', de: 'Spielplatz', en: 'playground' }],
      example: { ar: 'الْمَدْرَسَةُ قَرِيبَةٌ مِنَ الْبَيْتِ', de: 'Die Schule ist nahe beim Haus.', en: 'The school is near the house.' } },
    { id: 'dirasa', de: 'das Studium', en: 'study, studies', type: 'Verbalnomen', typeEn: 'Verbal noun', frequency: 3, relation: 'Handlung',
      segments: [R('دِ'), R('رَ'), P('ا'), R('سَ'), P('ة')], pattern: 'فِعَالَة',
      parallels: [{ ar: 'كِتَابَة', de: 'das Schreiben', en: 'writing' }, { ar: 'زِرَاعَة', de: 'Landwirtschaft', en: 'agriculture' }, { ar: 'قِرَاءَة', de: 'das Lesen', en: 'reading' }],
      example: { ar: 'الدِّرَاسَةُ مُهِمَّة', de: 'Das Studium ist wichtig.', en: 'Study is important.' } },
    { id: 'yudarris', de: 'er unterrichtet', en: 'he teaches', type: 'Verb (Präsens, Form II)', typeEn: 'Verb (present, Form II)', frequency: 3, relation: 'Handlung',
      segments: [P('يُ'), R('دَ'), R('رِّ'), R('سُ')], pattern: 'يُفَعِّلُ',
      parallels: [{ ar: 'يُعَلِّمُ', de: 'er lehrt', en: 'he instructs' }, { ar: 'يُنَظِّمُ', de: 'er organisiert', en: 'he organizes' }, { ar: 'يُرَتِّبُ', de: 'er ordnet', en: 'he arranges' }],
      example: { ar: 'يُدَرِّسُ اللُّغَةَ الْعَرَبِيَّةَ', de: 'Er unterrichtet die arabische Sprache.', en: 'He teaches the Arabic language.' } },
    { id: 'darrasa', de: 'er unterrichtete', en: 'he taught', type: 'Verb (Perfekt, Form II)', typeEn: 'Verb (perfect, Form II)', frequency: 2, relation: 'Handlung',
      segments: [R('دَ'), R('رَّ'), R('سَ')], pattern: 'فَعَّلَ',
      parallels: [{ ar: 'عَلَّمَ', de: 'er lehrte', en: 'he taught' }, { ar: 'نَظَّمَ', de: 'er organisierte', en: 'he organized' }, { ar: 'رَتَّبَ', de: 'er ordnete', en: 'he arranged' }],
      example: { ar: 'دَرَّسَ فِي الْجَامِعَةِ سَنَوَاتٍ طَوِيلَة', de: 'Er unterrichtete viele Jahre an der Universität.', en: 'He taught at the university for many years.' } },
  ]),

  // ---- ع م ل — tun, machen, arbeiten ----
  'عمل': family('عمل', 'tun, machen, arbeiten', 'to do, to make, to work', 'amal', [
    { id: 'amila', de: 'er tat, machte', en: 'he did, made', type: 'Verb (Perfekt)', typeEn: 'Verb (perfect)', frequency: 4, relation: 'Handlung',
      segments: [R('عَ'), R('مِ'), R('لَ')], pattern: 'فَعِلَ',
      parallels: [{ ar: 'فَرِحَ', de: 'er freute sich', en: 'he rejoiced' }, { ar: 'شَرِبَ', de: 'er trank', en: 'he drank' }, { ar: 'حَفِظَ', de: 'er bewahrte, lernte auswendig', en: 'he preserved, memorized' }],
      example: { ar: 'عَمِلَ عَمَلًا جَيِّدًا', de: 'Er hat gute Arbeit geleistet.', en: 'He did good work.' } },
    { id: 'yamalu', de: 'er arbeitet, macht', en: 'he works, does', type: 'Verb (Präsens)', typeEn: 'Verb (present)', frequency: 5, relation: 'Handlung',
      segments: [P('يَ'), R('عْ'), R('مَ'), R('لُ')], pattern: 'يَفْعَلُ',
      parallels: [{ ar: 'يَذْهَبُ', de: 'er geht', en: 'he goes' }, { ar: 'يَفْتَحُ', de: 'er öffnet', en: 'he opens' }, { ar: 'يَمْنَعُ', de: 'er verhindert', en: 'he prevents' }],
      example: { ar: 'يَعْمَلُ فِي شَرِكَةٍ كَبِيرَةٍ', de: 'Er arbeitet in einer grossen Firma.', en: 'He works at a large company.' } },
    { id: 'amal', de: 'Arbeit, Tat', en: 'work, deed', type: 'Nomen', typeEn: 'Noun', frequency: 5, relation: 'Ergebnis',
      segments: [R('عَ'), R('مَ'), R('ل')], pattern: 'فَعَل',
      parallels: [{ ar: 'دَرْس', de: 'Lektion', en: 'lesson' }, { ar: 'سَكَن', de: 'Wohnsitz', en: 'dwelling' }, { ar: 'قَوْل', de: 'Wort, Aussage', en: 'word, saying' }],
      example: { ar: 'الْعَمَلُ كَثِيرٌ الْيَوْمَ', de: 'Es gibt heute viel Arbeit.', en: 'There is a lot of work today.' } },
    { id: 'amil', de: 'Arbeiter', en: 'worker', type: 'Partizip Aktiv', typeEn: 'Active participle', frequency: 5, relation: 'Person',
      segments: [R('عَ'), P('ا'), R('مِ'), R('ل')], pattern: 'فَاعِل',
      parallels: [{ ar: 'كَاتِب', de: 'Schreiber', en: 'writer' }, { ar: 'سَاكِن', de: 'Bewohner', en: 'resident' }, { ar: 'طَالِب', de: 'Student', en: 'student' }],
      example: { ar: 'الْعَامِلُ فِي الْمَصْنَعِ', de: 'Der Arbeiter ist in der Fabrik.', en: 'The worker is in the factory.' } },
    { id: 'amila2', de: 'Arbeiterin', en: 'worker (f)', type: 'Partizip Aktiv, fem.', typeEn: 'Active participle, fem.', frequency: 3, relation: 'Person',
      segments: [R('عَ'), P('ا'), R('مِ'), R('لَ'), P('ة')], pattern: 'فَاعِلَة',
      parallels: [{ ar: 'كَاتِبَة', de: 'Schreiberin', en: 'writer (f)' }, { ar: 'سَاكِنَة', de: 'Bewohnerin', en: 'resident (f)' }, { ar: 'طَالِبَة', de: 'Studentin', en: 'student (f)' }],
      example: { ar: 'هِيَ عَامِلَةٌ مُجْتَهِدَة', de: 'Sie ist eine fleissige Arbeiterin.', en: 'She is a diligent worker.' } },
    { id: 'mamal', de: 'Werkstatt, Labor', en: 'workshop, laboratory', type: 'Ortsnomen', typeEn: 'Noun of place', frequency: 3, relation: 'Ort',
      segments: [P('مَ'), R('عْ'), R('مَ'), R('ل')], pattern: 'مَفْعَل',
      parallels: [{ ar: 'مَكْتَب', de: 'Büro', en: 'office' }, { ar: 'مَسْكَن', de: 'Wohnort', en: 'residence' }, { ar: 'مَلْعَب', de: 'Spielplatz', en: 'playground' }],
      example: { ar: 'الْمَعْمَلُ بَعِيدٌ عَنِ الْمَدِينَةِ', de: 'Das Labor ist weit von der Stadt entfernt.', en: 'The laboratory is far from the city.' } },
    { id: 'muamala', de: 'Behandlung, Umgang', en: 'treatment, dealing', type: 'Verbalnomen (Form III)', typeEn: 'Verbal noun (Form III)', frequency: 2, relation: 'Handlung',
      segments: [P('مُ'), R('عَ'), P('ا'), R('مَ'), R('لَ'), P('ة')], pattern: 'مُفَاعَلَة',
      parallels: [{ ar: 'مُكَاتَبَة', de: 'Korrespondenz', en: 'correspondence' }, { ar: 'مُشَاهَدَة', de: 'das Betrachten', en: 'watching' }, { ar: 'مُقَابَلَة', de: 'Begegnung', en: 'meeting' }],
      example: { ar: 'مُعَامَلَتُهُ حَسَنَةٌ مَعَ النَّاسِ', de: 'Sein Umgang mit den Leuten ist gut.', en: 'His treatment of people is good.' } },
    { id: 'istimal', de: 'Gebrauch, Verwendung', en: 'use, usage', type: 'Verbalnomen (Form X)', typeEn: 'Verbal noun (Form X)', frequency: 1, relation: 'Ergebnis',
      segments: [P('اِسْتِ'), R('عْ'), R('مَ'), P('ا'), R('ل')], pattern: 'اِسْتِفْعَال',
      parallels: [{ ar: 'اِسْتِخْدَام', de: 'Gebrauch, Verwendung', en: 'use, usage' }, { ar: 'اِسْتِقْبَال', de: 'Empfang', en: 'reception' }, { ar: 'اِسْتِعْدَاد', de: 'Bereitschaft', en: 'readiness' }],
      example: { ar: 'اِسْتِعْمَالُ الْهَاتِفِ مُفِيد', de: 'Die Verwendung des Telefons ist nützlich.', en: 'The use of the phone is useful.' } },
  ]),

  // ---- س ك ن — wohnen, ruhen ----
  'سكن': family('سكن', 'wohnen, ruhen', 'to dwell, to be still', 'maskan', [
    { id: 'sakana', de: 'er wohnte, beruhigte sich', en: 'he lived, became calm', type: 'Verb (Perfekt)', typeEn: 'Verb (perfect)', frequency: 4, relation: 'Handlung',
      segments: [R('سَ'), R('كَ'), R('نَ')], pattern: 'فَعَلَ',
      parallels: [{ ar: 'كَتَبَ', de: 'er schrieb', en: 'he wrote' }, { ar: 'دَرَسَ', de: 'er lernte', en: 'he studied' }, { ar: 'عَمِلَ', de: 'er tat', en: 'he did' }],
      example: { ar: 'سَكَنَ فِي هٰذَا الْحَيِّ سَنَوَاتٍ', de: 'Er wohnte jahrelang in diesem Viertel.', en: 'He lived in this neighborhood for years.' } },
    { id: 'yaskunu', de: 'er wohnt', en: 'he lives', type: 'Verb (Präsens)', typeEn: 'Verb (present)', frequency: 5, relation: 'Handlung',
      segments: [P('يَ'), R('سْ'), R('كُ'), R('نُ')], pattern: 'يَفْعُلُ',
      parallels: [{ ar: 'يَكْتُبُ', de: 'er schreibt', en: 'he writes' }, { ar: 'يَدْرُسُ', de: 'er lernt', en: 'he studies' }, { ar: 'يَخْرُجُ', de: 'er geht hinaus', en: 'he goes out' }],
      example: { ar: 'يَسْكُنُ فِي شَقَّةٍ صَغِيرَةٍ', de: 'Er wohnt in einer kleinen Wohnung.', en: 'He lives in a small apartment.' } },
    { id: 'sakin', de: 'Bewohner', en: 'resident', type: 'Partizip Aktiv', typeEn: 'Active participle', frequency: 4, relation: 'Person',
      segments: [R('سَ'), P('ا'), R('كِ'), R('ن')], pattern: 'فَاعِل',
      parallels: [{ ar: 'كَاتِب', de: 'Schreiber', en: 'writer' }, { ar: 'عَامِل', de: 'Arbeiter', en: 'worker' }, { ar: 'طَالِب', de: 'Student', en: 'student' }],
      example: { ar: 'السَّاكِنُ فِي الطَّابِقِ الْأَوَّلِ', de: 'Der Bewohner ist im ersten Stock.', en: 'The resident is on the first floor.' } },
    { id: 'sakan', de: 'Wohnsitz, Ruhe', en: 'dwelling, rest', type: 'Nomen', typeEn: 'Noun', frequency: 3, relation: 'Ergebnis',
      segments: [R('سَ'), R('كَ'), R('ن')], pattern: 'فَعَل',
      parallels: [{ ar: 'عَمَل', de: 'Arbeit', en: 'work' }, { ar: 'دَرْس', de: 'Lektion', en: 'lesson' }, { ar: 'قَوْل', de: 'Wort, Aussage', en: 'word, saying' }],
      example: { ar: 'وَجَدَ سَكَنًا مُنَاسِبًا', de: 'Er fand einen passenden Wohnsitz.', en: 'He found a suitable dwelling.' } },
    { id: 'maskan', de: 'Wohnung, Wohnort', en: 'dwelling, residence', type: 'Ortsnomen', typeEn: 'Noun of place', frequency: 4, relation: 'Ort',
      segments: [P('مَ'), R('سْ'), R('كَ'), R('ن')], pattern: 'مَفْعَل',
      parallels: [{ ar: 'مَكْتَب', de: 'Büro', en: 'office' }, { ar: 'مَعْمَل', de: 'Werkstatt', en: 'workshop' }, { ar: 'مَسْجِد', de: 'Moschee', en: 'mosque' }],
      example: { ar: 'الْمَسْكَنُ نَظِيفٌ وَمُرِيح', de: 'Die Wohnung ist sauber und bequem.', en: 'The dwelling is clean and comfortable.' } },
    { id: 'sukun', de: 'Ruhe, Stille', en: 'stillness, calm', type: 'Verbalnomen', typeEn: 'Verbal noun', frequency: 3, relation: 'Ergebnis',
      segments: [R('سُ'), R('كُ'), P('و'), R('ن')], pattern: 'فُعُول',
      parallels: [{ ar: 'جُلُوس', de: 'das Sitzen', en: 'sitting' }, { ar: 'خُرُوج', de: 'das Hinausgehen', en: 'going out' }, { ar: 'دُخُول', de: 'das Eintreten', en: 'entering' }],
      example: { ar: 'فِي الْبَيْتِ سُكُونٌ تَامّ', de: 'Im Haus herrscht vollkommene Ruhe.', en: 'There is complete stillness in the house.' } },
    { id: 'sukkan', de: 'Bewohner (Pl.), Einwohner', en: 'residents, inhabitants', type: 'Nomen (Plural)', typeEn: 'Noun (plural)', frequency: 3, relation: 'Person',
      segments: [R('سُ'), R('كَّ'), P('ا'), R('ن')], pattern: 'فُعَّال',
      parallels: [{ ar: 'كُتَّاب', de: 'Schreiber (Pl.)', en: 'writers' }, { ar: 'عُمَّال', de: 'Arbeiter (Pl.)', en: 'workers' }, { ar: 'طُلَّاب', de: 'Studenten (Pl.)', en: 'students' }],
      example: { ar: 'سُكَّانُ الْمَدِينَةِ كَثِيرُون', de: 'Die Einwohner der Stadt sind zahlreich.', en: 'The city\'s inhabitants are numerous.' } },
    { id: 'sakina', de: 'Ruhe, Gelassenheit, Seelenfrieden', en: 'tranquility, serenity, peace of mind', type: 'Eigenschafts-Nomen', typeEn: 'Quality noun', frequency: 2, relation: 'Ergebnis',
      segments: [R('سَ'), R('كِ'), P('ي'), R('نَ'), P('ة')], pattern: 'فَعِيلَة',
      parallels: [{ ar: 'كَرِيمَة', de: 'Grosszügige', en: 'generous (f)' }, { ar: 'جَمِيلَة', de: 'Schöne', en: 'beautiful (f)' }, { ar: 'رَحِيمَة', de: 'Barmherzige', en: 'merciful (f)' }],
      example: { ar: 'شَعَرْتُ بِالسَّكِينَةِ فِي قَلْبِي', de: 'Ich fühlte Frieden in meinem Herzen.', en: 'I felt peace in my heart.' } },
  ]),
};

export const ROOT_KEYS = Object.keys(ROOT_FAMILIES);

// ar (normalisiert) -> { rootKey, wordId } über alle Familien — macht
// Parallelen-Chips klickbar (RootExplorer.jsx), wenn das genannte Wort
// tatsächlich Teil einer der ausgearbeiteten Familien ist.
export const WORD_INDEX = new Map();
for (const rootKey of ROOT_KEYS) {
  for (const w of ROOT_FAMILIES[rootKey].words) {
    WORD_INDEX.set(normalizeCitation(w.ar), { rootKey, wordId: w.id });
  }
}
