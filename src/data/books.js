// Book registry. Ties vocabulary files to book metadata and derives the
// book -> unit tree at runtime so adding a word never requires touching
// two places. Add a new textbook by importing its vocab array and adding
// one BOOK_META entry.

import { quranCore } from './vocab/quranCore.js';
import { abyBook1 } from './vocab/abyBook1.js';
import { quran80 } from './vocab/quran80.js';

export const BOOK_META = [
  {
    id: 'aby-1',
    title: 'العربية بين يديك',
    subtitle: 'الكتاب الأول',
    titleDe: 'Al-ʿArabiyya bayna Yadayk — Band 1',
    descDe: 'Grundwortschatz für Anfänger, nach Themen geordnet.',
    level: 'A1',
    accent: '#3E6259',
  },
  {
    id: 'quran-core',
    title: 'أساسيات القرآن',
    subtitle: 'الجذور الشائعة',
    titleDe: 'Quran-Kernwortschatz',
    descDe: 'Häufige Wurzeln des Quran, in Wurzelfamilien gruppiert.',
    level: 'A2',
    accent: '#9C7A3C',
  },
  {
    id: 'quran-80',
    title: '٨٠٪ من كلمات القرآن',
    subtitle: 'قوائم مصنّفة',
    titleDe: '80 % der Quran-Wörter',
    descDe: 'Die häufigsten Wörter des Quran, nach Wortart geordnet.',
    level: 'A2',
    accent: '#4A6E7A',
  },
];

// All built-in vocabulary in one flat array.
export const BUILTIN_VOCAB = [...abyBook1, ...quranCore, ...quran80];

// Chapters whose name is exactly one of these belong at the very end of a
// book, unnumbered — cross-cutting grammar reference lists, not sequential
// thematic lessons. Matched on the whole (cleaned) name, not as a substring,
// so thematic chapters like "Demonstrativpronomen" or "Präpositionen (Ort)"
// stay numbered — only a chapter literally named "Pronomen" etc. trails.
const TRAILING_UNITS = ['pronomen', 'adverbien', 'adverb', 'präpositionen', 'präposition', 'praepositionen', 'praeposition'];

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toArabicNumeral = (n) => String(n).replace(/\d/g, (d) => ARABIC_DIGITS[+d]);

// Strip a leading "<num> · " / "<num>. " display prefix (Arabic or Latin
// digits) so numbering is idempotent no matter what's stored in a unitDe.
const baseUnitName = (titleDe) => titleDe.replace(/^[\s\d٠-٩]+[.·-]\s*/, '').trim();

const isTrailingUnit = (name) => TRAILING_UNITS.includes(name.trim().toLowerCase());
// Fixed order among the trailing chapters: pronouns, adverbs, prepositions.
const trailingRank = (name) => {
  const n = name.trim().toLowerCase();
  if (n.startsWith('pron')) return 0;
  if (n.startsWith('adverb')) return 1;
  return 2;
};

// Numbered thematic chapters first (١، ٢، ٣ …), then the grammatical
// categories at the end without numbers.
function orderAndNumber(units) {
  const normal = units.filter((u) => !isTrailingUnit(u.name));
  const trailing = units
    .filter((u) => isTrailingUnit(u.name))
    .sort((a, b) => trailingRank(a.name) - trailingRank(b.name));
  return [
    ...normal.map((u, i) => ({ ...u, titleDe: `${toArabicNumeral(i + 1)} · ${u.name}` })),
    ...trailing.map((u) => ({ ...u, titleDe: u.name })),
  ];
}

// Build the book -> units -> [vocab] tree, merging built-in and custom vocab.
// customVocab is whatever the learner added (from Dexie), same shape. Chapter
// numbers are assigned here at render time (not stored), so they stay
// continuous when chapters are added or removed.
export function buildBookTree(customVocab = []) {
  const all = [...BUILTIN_VOCAB, ...customVocab];
  return BOOK_META.map((book) => {
    const items = all.filter((v) => v.bookId === book.id);
    const unitMap = new Map();
    for (const v of items) {
      if (!unitMap.has(v.unit)) {
        unitMap.set(v.unit, { id: v.unit, name: baseUnitName(v.unitDe || v.unit), items: [] });
      }
      unitMap.get(v.unit).items.push(v);
    }
    return { ...book, total: items.length, units: orderAndNumber([...unitMap.values()]) };
  });
}

// Flat lookup for a scope: whole book, or one unit within a book.
export function vocabForScope(scope, customVocab = []) {
  const all = [...BUILTIN_VOCAB, ...customVocab];
  if (scope.unitId) return all.filter((v) => v.bookId === scope.bookId && v.unit === scope.unitId);
  return all.filter((v) => v.bookId === scope.bookId);
}
