// Thin wrapper around ts-fsrs (v5). The rest of the app never imports ts-fsrs
// directly — it goes through here, so the algorithm is swappable and the
// German rating labels live in one place.

import { fsrs, generatorParameters, createEmptyCard, Rating, State } from 'ts-fsrs';

// request_retention = target probability of recall at review time. 0.90 is
// the FSRS default. User-configurable (see Settings); persisted via db.js
// and applied here at app startup through setRetention().
export const DEFAULT_RETENTION = 0.9;

let retention = DEFAULT_RETENTION;
let scheduler = buildScheduler(retention);

// enable_fuzz spreads due dates so reviews don't clump. learning_steps /
// relearning_steps control the "Nochmal"-Intervall: ts-fsrs defaults to
// ['1m', '10m'] / ['10m'], das erste Wiederholen fühlte sich zu knapp an —
// auf 2 Minuten verlängert.
function buildScheduler(r) {
  return fsrs(generatorParameters({
    request_retention: r,
    enable_fuzz: true,
    learning_steps: ['2m', '10m'],
    relearning_steps: ['2m'],
  }));
}

// Rebuilds the internal ts-fsrs instance for a new target retention. Existing
// cards are unaffected — this only changes how *future* reviews are scheduled.
export function setRetention(r) {
  retention = r;
  scheduler = buildScheduler(r);
}

export function getRetention() {
  return retention;
}

// Simplified to a binary pass/fail — Hard/Easy are unused. Order matters:
// this is the left-to-right order of the grade buttons.
export const RATINGS = [
  { grade: Rating.Again, key: 'again', label: 'Nochmal' },
  { grade: Rating.Good, key: 'good', label: 'Weiß ich' },
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
// two buttons with their resulting intervals without committing anything.
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
