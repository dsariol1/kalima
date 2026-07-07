// Checks a typed production answer against a vocab entry. Accepts either the
// Latin transliteration or the Arabic script, so a learner can type whatever
// keyboard they have. Pure + framework-free — same spirit as interval.js.

// Harakat (U+064B–U+0652), superscript alef (U+0670) and tatweel (U+0640).
const ARABIC_MARKS = /[ً-ْٰـ]/g;

// Strip diacritics from a Latin transliteration and reduce to bare a–z, so
// "ṣabāḥu l-khayr" and "sabahu lkhayr" compare equal. NFD splits accented
// letters into base + combining mark; we then drop the marks and everything
// that isn't a plain letter (ʿ, ʾ, hyphens, spaces, …).
function normLatin(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

// Reduce Arabic to a bare, space-free form so an answer typed with or without
// harakat matches the stored `bare`/`ar`.
function normArabic(s) {
  return s.replace(ARABIC_MARKS, '').replace(/\s+/g, '');
}

// Returns { correct, matched: 'arabic' | 'translit' | null }.
export function checkAnswer(input, card) {
  const raw = (input || '').trim();
  if (!raw) return { correct: false, matched: null };

  const ar = normArabic(raw);
  if (ar && (ar === normArabic(card.bare) || ar === normArabic(card.ar))) {
    return { correct: true, matched: 'arabic' };
  }

  const latin = normLatin(raw);
  if (latin && latin === normLatin(card.translit)) {
    return { correct: true, matched: 'translit' };
  }

  return { correct: false, matched: null };
}
