// Mountet die Cloud-Sync-Engine (db/sync.js) einmal, sobald ein User eingeloggt
// ist. Löst den Abgleich aus bei: Login (nach Migration), im Intervall, bei
// `online`-Event und wenn der Tab wieder sichtbar wird. Berührt den Review-
// Hot-Path nicht — useReview.js schreibt weiter nur lokal, dieser Hook pusht
// die von db.js gefüllte syncQueue asynchron.

import { useEffect, useRef, useState, useCallback } from 'react';
import { runSync, migrateLocalDataToAccount } from '../db/sync.js';

const INTERVAL_MS = 60_000;

export function useSync({ enabled, onSynced }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'syncing' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const onSyncedRef = useRef(onSynced);
  onSyncedRef.current = onSynced;

  const tick = useCallback(async () => {
    if (!enabled) return;
    setStatus('syncing');
    try {
      const changed = await runSync();
      setStatus('idle');
      setLastSyncedAt(new Date());
      if (changed) onSyncedRef.current?.();
    } catch {
      // Offline/Serverfehler: Queue bleibt bestehen, nächster Trigger versucht erneut.
      setStatus('error');
    }
  }, [enabled]);

  // Erst-Login: bestehende lokale Daten migrieren, dann erster Sync.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        await migrateLocalDataToAccount();
      } catch {
        // Best-effort — der reguläre Sync unten holt Nicht-Migriertes nach.
      }
      if (!cancelled) tick();
    })();
    return () => { cancelled = true; };
  }, [enabled, tick]);

  // Laufende Trigger: Intervall + online + Tab-Sichtbarkeit.
  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(tick, INTERVAL_MS);
    const onOnline = () => tick();
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, tick]);

  return { status, lastSyncedAt, syncNow: tick };
}
