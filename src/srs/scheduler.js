// Thin wrapper around ts-fsrs (v5). The rest of the app never imports ts-fsrs
// directly — it goes through here, so the algorithm is swappable and the
// German rating labels live in one place.

import { fsrs, generatorParameters, createEmptyCard, Rating, State } from 'ts-fsrs';

// request_retention = target probability of recall at review time.
// 0.90 is the FSRS default and a sensible starting point; expose it later
// as a user setting. enable_fuzz spreads due dates so reviews don't clump.
const params = generatorParameters({
  request_retention: 0.9,
  enable_fuzz: true,
});

export const scheduler = fsrs(params);

// Order matters: this is the left-to-right order of the grade buttons.
export const RATINGS = [
  { grade: Rating.Again, key: 'again', label: 'Nochmal' },
  { grade: Rating.Hard, key: 'hard', label: 'Schwer' },
  { grade: Rating.Good, key: 'good', label: 'Gut' },
  { grade: Rating.Easy, key: 'easy', label: 'Leicht' },
];

// A fresh FSRS card for a word that's never been seen.
export function newCard(now = new Date()) {
  return createEmptyCard(now);
}

// Apply a grade, returning the next card state and a review log entry.
export function review(card, grade, now = new Date()) {
  return scheduler.next(card, now, grade);
}

// For each rating, what would the next due date be? Used to label the
// four buttons with their resulting intervals without committing anything.
export function previewDueDates(card, now = new Date()) {
  const out = {};
  for (const r of RATINGS) {
    out[r.key] = scheduler.next(card, now, r.grade).card.due;
  }
  return out;
}

// Current recall probability (0..1) — handy for stats.
export function retrievability(card, now = new Date()) {
  return scheduler.get_retrievability(card, now, false);
}

export { Rating, State };
