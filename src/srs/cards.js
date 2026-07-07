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
