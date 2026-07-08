// Card-direction helpers. No ts-fsrs import here — scheduler.js stays the
// only module that knows the algorithm; this just knows the id/gating rules
// shared between the review queue and the book picker's due/fresh counts.

export const DIRECTIONS = ['recognition', 'production'];

export function cardId(vocabId, direction) {
  return `${vocabId}::${direction}`;
}

// Production is locked until the recognition card has been reviewed at
// least once — no point asking someone to produce a word they've never
// even recognized yet.
export function isUnlocked(direction, recognitionProgress) {
  if (direction === 'recognition') return true;
  return !!recognitionProgress && recognitionProgress.reps > 0;
}

// Due/fresh counts across both directions for a list of vocab items — shared
// between the book list (whole-book totals) and a book's chapter rows
// (per-unit totals), so the gating rule above only has to be encoded once.
export function countDueFresh(items, progressMap, now = Date.now()) {
  let due = 0;
  let fresh = 0;
  for (const v of items) {
    const recProgress = progressMap[cardId(v.id, 'recognition')];
    for (const direction of DIRECTIONS) {
      if (direction === 'production' && !isUnlocked('production', recProgress)) continue;
      const p = progressMap[cardId(v.id, direction)];
      if (!p) fresh += 1;
      else if (new Date(p.due).getTime() <= now) due += 1;
    }
  }
  return { due, fresh };
}
