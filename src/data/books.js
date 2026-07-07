// Book registry. Ties vocabulary files to book metadata and derives the
// book -> unit tree at runtime so adding a word never requires touching
// two places. Add a new textbook by importing its vocab array and adding
// one BOOK_META entry.

import { quranCore } from './vocab/quranCore.js';
import { abyBook1 } from './vocab/abyBook1.js';

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
];

// All built-in vocabulary in one flat array.
export const BUILTIN_VOCAB = [...abyBook1, ...quranCore];

// Build the book -> units -> [vocab] tree, merging built-in and custom vocab.
// customVocab is whatever the learner added (from Dexie), same shape.
export function buildBookTree(customVocab = []) {
  const all = [...BUILTIN_VOCAB, ...customVocab];
  return BOOK_META.map((book) => {
    const items = all.filter((v) => v.bookId === book.id);
    const unitMap = new Map();
    for (const v of items) {
      if (!unitMap.has(v.unit)) {
        unitMap.set(v.unit, { id: v.unit, titleDe: v.unitDe || v.unit, items: [] });
      }
      unitMap.get(v.unit).items.push(v);
    }
    return { ...book, total: items.length, units: [...unitMap.values()] };
  });
}

// Flat lookup for a scope: whole book, or one unit within a book.
export function vocabForScope(scope, customVocab = []) {
  const all = [...BUILTIN_VOCAB, ...customVocab];
  if (scope.unitId) return all.filter((v) => v.bookId === scope.bookId && v.unit === scope.unitId);
  return all.filter((v) => v.bookId === scope.bookId);
}
