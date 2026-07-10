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

export async function addCustomVocabMany(entries) {
  await db.customVocab.bulkPut(entries);
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

// Lerntage in Folge, rückwärts ab heute gezählt. Tagesgrenzen in LOKALER
// Zeit (nicht UTC/ISO — sonst bricht ein Abend-Review die Serie über die
// UTC-Mitternacht). Hat heute noch kein Review stattgefunden, zählt die
// Serie ab gestern weiter — sie reißt erst, wenn ein ganzer Tag fehlt.
export async function currentStreak() {
  // Index-only walk over reviewedAt keys — no row hydration.
  const keys = await db.reviews.orderBy('reviewedAt').keys();
  if (!keys.length) return 0;
  const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const days = new Set(keys.map((k) => dayKey(new Date(k))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// --- settings ---
export async function getSetting(key, fallback) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

// --- backup (export / import) ---
// JSON round-trips Date objects as ISO strings, so revive the date-typed
// fields on the way back in — the FSRS scheduler needs real Date objects.
function reviveDates(rows, keys) {
  for (const r of rows) {
    for (const k of keys) if (r[k]) r[k] = new Date(r[k]);
  }
  return rows;
}

// The full local state: learner words, per-card FSRS progress, review log,
// and settings. Returned raw; the caller serialises + downloads it.
export async function exportAll() {
  const [progress, customVocab, reviews, settings] = await Promise.all([
    db.progress.toArray(),
    db.customVocab.toArray(),
    db.reviews.toArray(),
    db.settings.toArray(),
  ]);
  return { progress, customVocab, reviews, settings };
}

// Non-destructive restore: bulkPut upserts by primary key, so importing never
// deletes what's already there — it merges the backup in (re-importing the same
// file is idempotent). Returns how many rows were written per table.
export async function importAll(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Ungültige Sicherungsdatei.');
  }
  const progress = reviveDates(payload.progress || [], ['due', 'last_review']);
  const customVocab = payload.customVocab || [];
  const reviews = reviveDates(payload.reviews || [], ['reviewedAt']);
  const settings = payload.settings || [];
  if (![progress, customVocab, reviews, settings].some((a) => a.length)) {
    throw new Error('Sicherungsdatei enthält keine bekannten Daten.');
  }

  await db.transaction('rw', db.progress, db.customVocab, db.reviews, db.settings, async () => {
    if (customVocab.length) await db.customVocab.bulkPut(customVocab);
    if (progress.length) await db.progress.bulkPut(progress);
    if (reviews.length) await db.reviews.bulkPut(reviews);
    if (settings.length) await db.settings.bulkPut(settings);
  });

  return {
    progress: progress.length,
    customVocab: customVocab.length,
    reviews: reviews.length,
    settings: settings.length,
  };
}
