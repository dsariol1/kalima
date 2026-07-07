// IndexedDB persistence via Dexie. Replaces the Claude.ai-only window.storage
// used in the throwaway prototype. Dexie stores Date objects natively, so
// FSRS card due-dates round-trip without manual serialisation.

import Dexie from 'dexie';
import { cardId } from '../srs/cards.js';

export const db = new Dexie('FushaVocab');

db.version(1).stores({
  // FSRS card state per vocab id. Indexed by due + state + bookId for querying.
  progress: 'id, due, state, bookId',
  // Learner-added words (same shape as built-in vocab entries).
  customVocab: 'id, bookId, unit',
  // Append-only review history for stats.
  reviews: '++logId, vocabId, reviewedAt',
  // Small key/value store for preferences.
  settings: 'key',
});

db.version(2)
  .stores({
    // One row per (vocab, direction) card now. `id` is `${vocabId}::${direction}`.
    progress: 'id, vocabId, direction, due, state, bookId',
    customVocab: 'id, bookId, unit',
    reviews: '++logId, vocabId, reviewedAt',
    settings: 'key',
  })
  .upgrade(async (tx) => {
    // Pre-v2 rows are keyed by bare vocabId and are what recognition cards
    // used to be (the app only ever quizzed Arabic -> German). Re-key them
    // rather than lose the learner's progress.
    const rows = await tx.table('progress').toArray();
    for (const r of rows) {
      await tx.table('progress').delete(r.id);
      await tx.table('progress').put({
        ...r,
        id: cardId(r.id, 'recognition'),
        vocabId: r.id,
        direction: 'recognition',
      });
    }
  });

// --- progress ---
export async function loadProgress() {
  const rows = await db.progress.toArray();
  const map = {};
  for (const r of rows) map[r.id] = r;
  return map;
}

export async function saveProgress(vocabId, direction, bookId, card) {
  // Spread the FSRS card fields alongside our keys.
  await db.progress.put({ id: cardId(vocabId, direction), vocabId, direction, bookId, ...card });
}

// --- custom vocab ---
export async function loadCustomVocab() {
  return db.customVocab.toArray();
}

export async function addCustomVocab(entry) {
  await db.customVocab.put(entry);
}

export async function deleteCustomVocab(id) {
  await db.customVocab.delete(id);
  await db.progress.where('vocabId').equals(id).delete();
}

// --- reviews (stats) ---
export async function logReview(vocabId, direction, grade) {
  await db.reviews.add({ vocabId, direction, grade, reviewedAt: new Date() });
}

export async function reviewsToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return db.reviews.where('reviewedAt').aboveOrEqual(start).count();
}

// --- settings ---
export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}
