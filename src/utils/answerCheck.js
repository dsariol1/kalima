// Checks a typed production answer against a vocab entry. Only the Arabic
// script counts — no transliteration fallback, so learners build the actual
// skill of writing the word, not a romanized shortcut. Pure + framework-free
// — same spirit as interval.js.

// Harakat (U+064B–U+0652), superscript alef (U+0670) and tatweel (U+0640).
const ARABIC_MARKS = /[ً-ْٰـ]/g;

// Reduce Arabic to a bare, space-free form so an answer typed with or without
// harakat matches the stored `bare`/`ar`.
function normArabic(s) {
  return s.replace(ARABIC_MARKS, '').replace(/\s+/g, '');
}

export function checkAnswer(input, card) {
  const ar = normArabic((input || '').trim());
  if (!ar) return false;
  return ar === normArabic(card.bare) || ar === normArabic(card.ar);
}
