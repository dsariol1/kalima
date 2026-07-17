// Cloud-Sync-Engine. Local-first: Dexie bleibt der primäre Store, hier läuft
// nur der Abgleich mit PocketBase im Hintergrund. Getrennt von db.js (Dexie)
// und auth/pocketbase.js (SDK) — dieses Modul verdrahtet beide, ohne dass db.js
// je das PocketBase-SDK sieht.
//
// Konfliktstrategie: last-write-wins pro Zeile über das client-gestempelte
// `clientUpdatedAt`. reviews sind append-only (insert-if-absent, kein Merge).
// Nichts hier läuft im Review-Hot-Path von useReview.js — Push liest nur die
// syncQueue, die db.js fire-and-forget füllt.

import { pb, currentUserId } from '../auth/pocketbase.js';
import {
  readSyncQueue, removeSyncEntries, getSyncRow, bulkPutRaw,
  existingReviewLocalIds, bulkAddReviews, getSetting, setSetting,
  exportAll, enqueueForSync, backfillReviewLocalIds,
} from './db.js';

// --- Datums-Helfer ---
// clientUpdatedAt/reviewedAt/due sind Pflicht → nie null (Fallback jetzt, u. a.
// für Alt-Zeilen ohne Stempel). Datumsfelder innerhalb des Karten-Blobs werden
// generisch in serializeCard behandelt.
const isoNow = (v) => (v ? new Date(v) : new Date()).toISOString();
const toMs = (v) => (v ? new Date(v).getTime() : 0);

// --- Collection-Konfiguration ---
const localKeyField = { progress: 'id', customVocab: 'id', settings: 'key' };
const VOCAB_FIELDS = ['bookId', 'unit', 'unitDe', 'pos', 'ar', 'bare', 'translit', 'de', 'root', 'rootMeaning', 'example'];

// --- Mapper lokal <-> remote ---

// FSRS-Kartenzustand als ganzer Blob, damit kein Feld beim Round-Trip verloren
// geht (siehe SCHEMA.md). Datumsfelder darin zu ISO / zurück zu Date.
function serializeCard(card) {
  const out = {};
  for (const [k, v] of Object.entries(card)) out[k] = v instanceof Date ? v.toISOString() : v;
  return out;
}
function deserializeCard(card) {
  const out = { ...card };
  if (out.due) out.due = new Date(out.due);
  if (out.last_review) out.last_review = new Date(out.last_review);
  return out;
}

function progressToRemote(row, owner) {
  const { id, vocabId, direction, bookId, clientUpdatedAt, ...card } = row;
  return {
    owner, cardId: id, vocabId, direction, bookId: bookId ?? '',
    card: serializeCard(card),
    clientUpdatedAt: isoNow(clientUpdatedAt),
  };
}
function progressToLocal(rec) {
  return {
    id: rec.cardId, vocabId: rec.vocabId, direction: rec.direction, bookId: rec.bookId,
    ...deserializeCard(rec.card || {}),
    clientUpdatedAt: new Date(rec.clientUpdatedAt),
  };
}

function customVocabToRemote(row, owner) {
  const { id, clientUpdatedAt, ...fields } = row;
  return { owner, vocabId: id, ...fields, clientUpdatedAt: isoNow(clientUpdatedAt) };
}
function customVocabToLocal(rec) {
  // Nur die bekannten Vokabelfelder übernehmen — PocketBase-Metafelder
  // (id, owner, created, …) bleiben außen vor.
  const out = { id: rec.vocabId, clientUpdatedAt: new Date(rec.clientUpdatedAt) };
  for (const f of VOCAB_FIELDS) if (rec[f] !== undefined) out[f] = rec[f];
  return out;
}

function settingsToRemote(row, owner) {
  return { owner, key: row.key, value: row.value, clientUpdatedAt: isoNow(row.clientUpdatedAt) };
}
function settingsToLocal(rec) {
  return { key: rec.key, value: rec.value, clientUpdatedAt: new Date(rec.clientUpdatedAt) };
}

function reviewToRemote(row, owner) {
  return {
    owner, localId: row.localId, vocabId: row.vocabId,
    direction: row.direction, grade: row.grade, reviewedAt: isoNow(row.reviewedAt),
  };
}
function reviewToLocal(rec) {
  return {
    localId: rec.localId, vocabId: rec.vocabId, direction: rec.direction,
    grade: rec.grade, reviewedAt: new Date(rec.reviewedAt),
  };
}

const TO_REMOTE = {
  progress: progressToRemote,
  customVocab: customVocabToRemote,
  settings: settingsToRemote,
  reviews: reviewToRemote,
};
const REMOTE_KEY = { progress: 'cardId', customVocab: 'vocabId', settings: 'key', reviews: 'localId' };

// --- Push ---

async function pushOne(table, key, owner) {
  const row = await getSyncRow(table, key);
  if (!row) return; // lokal gelöscht → nichts hochzuladen
  const data = TO_REMOTE[table](row, owner);
  const businessKey = data[REMOTE_KEY[table]];
  const filter = pb.filter(`owner = {:owner} && ${REMOTE_KEY[table]} = {:key}`, { owner, key: businessKey });

  let existing = null;
  try {
    existing = await pb.collection(table).getFirstListItem(filter);
  } catch (e) {
    if (e?.status !== 404) throw e; // 404 = existiert noch nicht → anlegen
  }

  if (existing) {
    if (table === 'reviews') return; // append-only, schon vorhanden
    await pb.collection(table).update(existing.id, data);
  } else {
    await pb.collection(table).create(data);
  }
}

export async function syncPush() {
  const owner = currentUserId();
  if (!owner) return;
  const queue = await readSyncQueue();
  if (!queue.length) return;

  const done = [];
  for (const item of queue) {
    try {
      await pushOne(item.table, item.key, owner);
      done.push(item.syncKey);
    } catch (e) {
      // 400 = Validierungsfehler (nicht behebbar) → Eintrag verwerfen, sonst
      // blockiert er die Queue für immer. Alles andere (offline/5xx/Auth) bleibt
      // in der Queue und wird beim nächsten Lauf erneut versucht.
      if (e?.status === 400) {
        // eslint-disable-next-line no-console
        console.warn('Sync-Push verworfen (400):', item.syncKey, e?.message);
        done.push(item.syncKey);
      }
    }
  }
  await removeSyncEntries(done);
}

// --- Pull ---

async function fetchOwned(collection, owner, since) {
  const filter = since
    ? pb.filter('owner = {:owner} && updated > {:since}', { owner, since })
    : pb.filter('owner = {:owner}', { owner });
  return pb.collection(collection).getFullList({ filter, sort: 'updated' });
}

// Gibt den neuesten gesehenen `updated`-Serverwert zurück (String, PB-Format) —
// wird als Watermark gespeichert, um beim nächsten Pull nur Neues zu ziehen.
async function pullUpsert(table, toLocal, owner, since, maxUpdated) {
  const records = await fetchOwned(table, owner, since);
  const toWrite = [];
  for (const rec of records) {
    if (!maxUpdated || rec.updated > maxUpdated) maxUpdated = rec.updated;
    const local = toLocal(rec);
    const existing = await getSyncRow(table, local[localKeyField[table]]);
    // last-write-wins: nur schreiben, wenn Remote-Edit neuer ist als lokal.
    if (!existing || toMs(rec.clientUpdatedAt) > toMs(existing.clientUpdatedAt)) {
      toWrite.push(local);
    }
  }
  if (toWrite.length) await bulkPutRaw(table, toWrite);
  return { maxUpdated, changed: toWrite.length };
}

async function pullReviews(owner, since, maxUpdated) {
  const records = await fetchOwned('reviews', owner, since);
  if (!records.length) return { maxUpdated, changed: 0 };
  const existing = await existingReviewLocalIds();
  const toAdd = [];
  for (const rec of records) {
    if (!maxUpdated || rec.updated > maxUpdated) maxUpdated = rec.updated;
    if (!existing.has(rec.localId)) toAdd.push(reviewToLocal(rec));
  }
  if (toAdd.length) await bulkAddReviews(toAdd);
  return { maxUpdated, changed: toAdd.length };
}

// Gibt true zurück, wenn lokale Daten verändert wurden (App soll neu laden).
export async function syncPull() {
  const owner = currentUserId();
  if (!owner) return false;

  const since = await getSetting('syncLastPull', null);
  let maxUpdated = since;
  let changed = 0;

  for (const [table, toLocal] of [
    ['progress', progressToLocal],
    ['customVocab', customVocabToLocal],
    ['settings', settingsToLocal],
  ]) {
    const r = await pullUpsert(table, toLocal, owner, since, maxUpdated);
    maxUpdated = r.maxUpdated;
    changed += r.changed;
  }
  const rv = await pullReviews(owner, since, maxUpdated);
  maxUpdated = rv.maxUpdated;
  changed += rv.changed;

  if (maxUpdated && maxUpdated !== since) await setSetting('syncLastPull', maxUpdated);
  return changed > 0;
}

// --- Öffentlicher Lauf: Push dann Pull (Reihenfolge vermeidet das sofortige
// Zurückziehen gerade hochgeladener Zeilen). Gibt zurück, ob lokal etwas neu ist.
let running = false;
export async function runSync() {
  if (running || !currentUserId()) return false;
  running = true;
  try {
    await syncPush();
    return await syncPull();
  } finally {
    running = false;
  }
}

// --- Erst-Login-Migration ---
// Bestehenden lokalen Dexie-Stand einmalig ins Konto hochladen. Nutzt exportAll()
// als Basis (keine neue Lese-Logik) und die normale Push-Upsert-Route.
export async function migrateLocalDataToAccount() {
  const owner = currentUserId();
  if (!owner) return;
  const flagKey = `migratedToAccount:${owner}`;
  if (await getSetting(flagKey, false)) return;

  await backfillReviewLocalIds(); // Alt-Reviews mit localId versehen
  const { progress, customVocab, reviews, settings } = await exportAll();

  for (const r of progress) await enqueueForSync('progress', r.id);
  for (const r of customVocab) await enqueueForSync('customVocab', r.id);
  for (const r of reviews) if (r.localId) await enqueueForSync('reviews', r.localId);
  for (const r of settings) {
    if (r.key === 'pbAuth' || r.key === 'syncLastPull' || r.key.startsWith('migratedToAccount')) continue;
    await enqueueForSync('settings', r.key);
  }

  await syncPush();
  await setSetting(flagKey, true);
}
