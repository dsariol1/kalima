// Starter vocabulary aligned with the thematic progression of
// "Al-ʿArabiyya bayna Yadayk", Book 1 (greetings, family, classroom, home).
//
// IMPORTANT: this is NOT a transcription of the book. These are standard
// beginner words that appear in every A1 Arabic curriculum; the words and
// their meanings are language facts. Example sentences here are original,
// deliberately simple constructions — not taken from the book. Use the
// "add word" feature to build your own deck from the lessons you study.

export const abyBook1 = [
  // ---- Unit 1: Begrüssung & Vorstellung ----
  { id: 'aby-greet-1', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'phrase',
    root: null, ar: 'مَرْحَبًا', bare: 'مرحبا', translit: 'marḥaban', de: 'Hallo, willkommen' },
  { id: 'aby-greet-2', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'phrase',
    root: null, ar: 'صَبَاحُ الْخَيْرِ', bare: 'صباح الخير', translit: 'ṣabāḥu l-khayr', de: 'Guten Morgen' },
  { id: 'aby-greet-3', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'noun',
    root: ['س', 'م', 'و'], rootMeaning: 'hoch sein / benennen', ar: 'اِسْم', bare: 'اسم', translit: 'ism', de: 'Name',
    example: { ar: 'مَا اسْمُكَ؟', de: 'Wie heisst du?' } },
  { id: 'aby-greet-4', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'noun',
    root: null, ar: 'طَالِب', bare: 'طالب', translit: 'ṭālib', de: 'Student, Schüler' },
  { id: 'aby-greet-5', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'noun',
    root: null, ar: 'مُدَرِّس', bare: 'مدرس', translit: 'mudarris', de: 'Lehrer' },
  { id: 'aby-greet-6', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'noun',
    root: ['ب', 'ل', 'د'], rootMeaning: 'Land', ar: 'بَلَد', bare: 'بلد', translit: 'balad', de: 'Land' },
  { id: 'aby-greet-7', bookId: 'aby-1', unit: 'u1', unitDe: '١ · Begrüssung & Vorstellung', pos: 'phrase',
    root: null, ar: 'مِنْ أَيْنَ؟', bare: 'من أين', translit: 'min ayna', de: 'Woher?' },

  // ---- Unit 2: Familie ----
  { id: 'aby-fam-1', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: null, ar: 'أُسْرَة', bare: 'أسرة', translit: 'usra', de: 'Familie' },
  { id: 'aby-fam-2', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: null, ar: 'أَب', bare: 'أب', translit: 'ab', de: 'Vater' },
  { id: 'aby-fam-3', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: null, ar: 'أُمّ', bare: 'أم', translit: 'umm', de: 'Mutter',
    example: { ar: 'هٰذِهِ أُمِّي', de: 'Das ist meine Mutter.' } },
  { id: 'aby-fam-4', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: null, ar: 'أَخ', bare: 'أخ', translit: 'akh', de: 'Bruder' },
  { id: 'aby-fam-5', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: null, ar: 'أُخْت', bare: 'أخت', translit: 'ukht', de: 'Schwester' },
  { id: 'aby-fam-6', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: ['و', 'ل', 'د'], rootMeaning: 'gebären', ar: 'وَلَد', bare: 'ولد', translit: 'walad', de: 'Junge, Kind' },
  { id: 'aby-fam-7', bookId: 'aby-1', unit: 'u2', unitDe: '٢ · Familie', pos: 'noun',
    root: ['ب', 'ن', 'ت'], rootMeaning: 'Tochter', ar: 'بِنْت', bare: 'بنت', translit: 'bint', de: 'Mädchen, Tochter' },

  // ---- Unit 3: Das Haus ----
  { id: 'aby-home-1', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: ['ب', 'ي', 'ت'], rootMeaning: 'übernachten', ar: 'بَيْت', bare: 'بيت', translit: 'bayt', de: 'Haus' },
  { id: 'aby-home-2', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: null, ar: 'غُرْفَة', bare: 'غرفة', translit: 'ghurfa', de: 'Zimmer' },
  { id: 'aby-home-3', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: null, ar: 'مَطْبَخ', bare: 'مطبخ', translit: 'maṭbakh', de: 'Küche' },
  { id: 'aby-home-4', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: null, ar: 'سَرِير', bare: 'سرير', translit: 'sarīr', de: 'Bett' },
  { id: 'aby-home-5', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: ['م', 'ي', 'ه'], rootMeaning: 'Wasser', ar: 'مَاء', bare: 'ماء', translit: 'māʾ', de: 'Wasser' },
  { id: 'aby-home-6', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: null, ar: 'طَعَام', bare: 'طعام', translit: 'ṭaʿām', de: 'Essen, Speise',
    example: { ar: 'الطَّعَامُ فِي الْمَطْبَخِ', de: 'Das Essen ist in der Küche.' } },
  { id: 'aby-home-7', bookId: 'aby-1', unit: 'u3', unitDe: '٣ · Das Haus', pos: 'noun',
    root: null, ar: 'حَمَّام', bare: 'حمام', translit: 'ḥammām', de: 'Badezimmer' },

  // ---- Unit 4: Klassenraum & Studium ----
  { id: 'aby-class-1', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: ['ق', 'ل', 'م'], rootMeaning: 'Schreibrohr', ar: 'قَلَم', bare: 'قلم', translit: 'qalam', de: 'Stift' },
  { id: 'aby-class-2', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: ['ك', 'ت', 'ب'], rootMeaning: 'schreiben', ar: 'كِتَاب', bare: 'كتاب', translit: 'kitāb', de: 'Buch' },
  { id: 'aby-class-3', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: ['ب', 'و', 'ب'], rootMeaning: 'Tür', ar: 'بَاب', bare: 'باب', translit: 'bāb', de: 'Tür' },
  { id: 'aby-class-4', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: null, ar: 'نَافِذَة', bare: 'نافذة', translit: 'nāfidha', de: 'Fenster' },
  { id: 'aby-class-5', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: ['ك', 'ر', 'س'], rootMeaning: 'Sitz', ar: 'كُرْسِيّ', bare: 'كرسي', translit: 'kursī', de: 'Stuhl' },
  { id: 'aby-class-6', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: null, ar: 'مَكْتَب', bare: 'مكتب', translit: 'maktab', de: 'Schreibtisch, Büro',
    example: { ar: 'الْكِتَابُ عَلَى الْمَكْتَبِ', de: 'Das Buch ist auf dem Schreibtisch.' } },
  { id: 'aby-class-7', bookId: 'aby-1', unit: 'u4', unitDe: '٤ · Klassenraum & Studium', pos: 'noun',
    root: ['د', 'ر', 'س'], rootMeaning: 'lernen, studieren', ar: 'مَدْرَسَة', bare: 'مدرسة', translit: 'madrasa', de: 'Schule' },
];
