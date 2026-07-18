// Einziger Boundary zum PocketBase-SDK — analog dazu, dass nur scheduler.js
// ts-fsrs kennt. db.js importiert dieses Modul nie; der Sync-Layer (db/sync.js)
// baut darauf auf. So bleibt lokale Persistenz (Dexie) sauber vom Remote-Backend
// getrennt.
//
// Auth-Token wird NICHT im localStorage gehalten (Projektregel), sondern über
// den bestehenden settings-Store in Dexie — via AsyncAuthStore. Der Token liegt
// serialisiert unter dem settings-Key `pbAuth`.

import PocketBase, { AsyncAuthStore } from 'pocketbase';
import { getSetting, setSetting } from '../db/db.js';

const PB_AUTH_KEY = 'pbAuth';

const authStore = new AsyncAuthStore({
  // Persistiert bei jeder Auth-Änderung (Login/Refresh/Logout) den serialisierten
  // Token in Dexie. Fire-and-forget reicht — die SDK-Signatur ist async.
  save: async (serialized) => {
    await setSetting(PB_AUTH_KEY, serialized);
  },
  clear: async () => {
    await setSetting(PB_AUTH_KEY, '');
  },
  // Beim Start den zuletzt gespeicherten Token laden. getSetting ist async →
  // AsyncAuthStore akzeptiert ein Promise als `initial`.
  initial: getSetting(PB_AUTH_KEY, ''),
});

const baseUrl = import.meta.env.VITE_POCKETBASE_URL;

export const pb = new PocketBase(baseUrl, authStore);

// Warnung statt stiller Fehlschlag, falls die Env-Variable im Build fehlt.
if (!baseUrl) {
  // eslint-disable-next-line no-console
  console.warn('VITE_POCKETBASE_URL ist nicht gesetzt — Login/Sync ist deaktiviert.');
}

// --- Auth-Aktionen ---

export async function register(email, password) {
  await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
  });
  // Direkt einloggen (Verifizierung ist standardmäßig nicht Pflicht). Ist sie
  // aktiviert, wirft authWithPassword — der Aufrufer zeigt dann den Hinweis.
  return login(email, password);
}

export async function login(email, password) {
  return pb.collection('users').authWithPassword(email, password);
}

export function logout() {
  pb.authStore.clear();
}

export async function requestPasswordReset(email) {
  return pb.collection('users').requestPasswordReset(email);
}

export async function confirmPasswordReset(token, password, passwordConfirm) {
  return pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
}

export async function changePassword(oldPassword, password, passwordConfirm) {
  const userId = pb.authStore.record.id;
  return pb.collection('users').update(userId, { oldPassword, password, passwordConfirm });
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}

export function currentUserId() {
  return pb.authStore.record?.id ?? null;
}
