import { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { buildBookTree } from './data/books.js';
import { countDueFresh } from './srs/cards.js';
import { loadProgress, loadCustomVocab, addCustomVocab, addCustomVocabMany, exportAll, importAll, getSetting, setSetting } from './db/db.js';
import { DEFAULT_RETENTION, setRetention as configureRetention } from './srs/scheduler.js';
import { DEFAULT_NEW_PER_SESSION } from './hooks/useReview.js';
import BookList from './components/BookList.jsx';
import BookDetail from './components/BookDetail.jsx';
import ReviewSession from './components/ReviewSession.jsx';
import AddWord from './components/AddWord.jsx';
import BulkAddWords from './components/BulkAddWords.jsx';
import BackupControls from './components/BackupControls.jsx';
import Settings from './components/Settings.jsx';
import RootExplorer from './components/RootExplorer.jsx';
import { C, card, backBtn } from './theme.js';

// Top-level state machine: 'books' (dashboard landing) -> 'bookDetail' (one
// book's chapters) -> 'review' | 'add' | 'bulkAdd'; 'settings' is reached via
// the header gear. Loads progress and custom vocab from IndexedDB once, then
// hands slices to each screen.
export default function App() {
  const [progressMap, setProgressMap] = useState(null);
  const [customVocab, setCustomVocab] = useState([]);
  const [harakat, setHarakat] = useState(true);
  const [view, setView] = useState('books');
  const [scope, setScope] = useState(null);
  // Overlay statt eigener View: bleibt unabhängig davon offenbar/schliessbar,
  // welche View gerade aktiv ist — insbesondere darf eine laufende
  // ReviewSession beim Öffnen nicht unmounten (sonst geht der Fortschritt
  // der aktuellen Runde verloren).
  const [explorer, setExplorer] = useState(null); // { rootKey, ar } | null
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [retention, setRetentionState] = useState(DEFAULT_RETENTION);
  const [newPerSession, setNewPerSession] = useState(DEFAULT_NEW_PER_SESSION);

  useEffect(() => {
    (async () => {
      const [p, c, r, n] = await Promise.all([
        loadProgress(),
        loadCustomVocab(),
        getSetting('retention', DEFAULT_RETENTION),
        getSetting('newPerSession', DEFAULT_NEW_PER_SESSION),
      ]);
      setProgressMap(p);
      setCustomVocab(c);
      setRetentionState(r);
      setNewPerSession(n);
      configureRetention(r);
    })();
  }, []);

  const tree = useMemo(() => buildBookTree(customVocab), [customVocab]);

  // Today's totals across all books for the dashboard stat card. Same
  // countDueFresh the per-book badges use — no separate due logic.
  const todayTotals = useMemo(() => {
    if (!progressMap) return { due: 0, fresh: 0 };
    return countDueFresh(tree.flatMap((b) => b.units.flatMap((u) => u.items)), progressMap);
  }, [tree, progressMap]);

  const selectedBook = useMemo(
    () => tree.find((b) => b.id === selectedBookId) || null,
    [tree, selectedBookId]
  );

  // `cardId` is the composite `${vocabId}::${direction}` key from useReview/db.
  const handleProgressChange = useCallback((cardId, card) => {
    setProgressMap((m) => ({ ...m, [cardId]: { id: cardId, ...card } }));
  }, []);

  const startReview = useCallback((s) => {
    setScope(s);
    setView('review');
  }, []);

  // Einstieg in den Wurzel-Explorer, wahlweise von einer Flashcard aus
  // zentriert auf deren Wurzel + Wort (rootKey/ar — Prototyp kennt nur vier
  // Wurzeln, trifft eine Karte keine davon, zeigt der Explorer seinen
  // Standard-Einstieg). Öffnet als Overlay, kein View-Wechsel.
  const openRootExplorer = useCallback((rootKey = null, ar = null) => {
    setExplorer({ rootKey, ar });
  }, []);

  const learnWordFromExplorer = useCallback(async (entry) => {
    await addCustomVocab(entry);
    setCustomVocab((v) => [...v, entry]);
  }, []);

  const scopeLabel = useMemo(() => {
    if (!scope) return '';
    const book = tree.find((b) => b.id === scope.bookId);
    if (!book) return '';
    if (scope.unitId) {
      const u = book.units.find((x) => x.id === scope.unitId);
      return `${book.titleDe} · ${u?.titleDe || ''}`;
    }
    return book.titleDe;
  }, [scope, tree]);

  const saveWord = useCallback(async (entry) => {
    await addCustomVocab(entry);
    setCustomVocab((v) => [...v, entry]);
    setView('bookDetail');
  }, []);

  const saveBulkWords = useCallback(async (entries) => {
    await addCustomVocabMany(entries);
    setCustomVocab((v) => [...v, ...entries]);
    setView('bookDetail');
  }, []);

  const handleExport = useCallback(async () => {
    const data = await exportAll();
    const stamp = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fusha-vocab-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(async (file) => {
    const payload = JSON.parse(await file.text());
    const counts = await importAll(payload);
    const [p, c] = await Promise.all([loadProgress(), loadCustomVocab()]);
    setProgressMap(p);
    setCustomVocab(c);
    return counts;
  }, []);

  const handleRetentionChange = useCallback((r) => {
    setRetentionState(r);
    configureRetention(r);
    setSetting('retention', r);
  }, []);

  const handleNewPerSessionChange = useCallback((n) => {
    setNewPerSession(n);
    setSetting('newPerSession', n);
  }, []);

  if (progressMap === null) {
    return <div style={{ fontFamily: 'Inter, sans-serif', color: C.textSoft, padding: '3rem', textAlign: 'center' }}>Lade …</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh',
      color: C.text, padding: '1.5rem 1rem 3rem',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '0.85rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Full lockup (icon + wordmark baked into one image). */}
            <img
              src="/KalimaLogo.png"
              alt="Kalima+"
              style={{ height: 60, width: 'auto', display: 'block', mixBlendMode: 'multiply' }}
            />
          </div>
          {/* Harakat toggle only matters while a word is being quizzed. */}
          {view === 'review' && (
            <button
              onClick={() => setHarakat((h) => !h)}
              style={{
                fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
                background: harakat ? C.primarySoft : 'transparent',
                border: `1px solid ${harakat ? C.primary : C.border}`, borderRadius: 999, padding: '4px 10px',
                color: harakat ? C.primary : C.textSoft, cursor: 'pointer',
              }}
            >
              Harakat {harakat ? 'an' : 'aus'}
            </button>
          )}
          {view === 'books' && (
            <button
              onClick={() => setView('settings')}
              aria-label="Einstellungen"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 999, background: 'transparent',
                border: 'none', color: C.textSoft, cursor: 'pointer',
              }}
            >
              <SettingsIcon size={19} />
            </button>
          )}
        </header>

        {view === 'books' && (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, margin: '0 0 0.9rem' }}>
              {greeting}
            </h1>
            <div style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '1.5rem' }}>
              {todayTotals.due > 0 ? (
                <>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 600, color: C.primary }}>
                    {todayTotals.due}
                  </span>
                  <span style={{ fontSize: 14 }}>Karten heute fällig</span>
                  {todayTotals.fresh > 0 && (
                    <span style={{ fontSize: 13, color: C.textSoft }}>· {todayTotals.fresh} neu</span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 14, color: C.textSoft }}>
                  Alles gelernt für heute{todayTotals.fresh > 0 ? ` · ${todayTotals.fresh} neue Karten warten` : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: C.textSoft, marginBottom: '0.6rem' }}>Bücher</div>
            <BookList
              tree={tree}
              progressMap={progressMap}
              onSelectBook={(bookId) => { setSelectedBookId(bookId); setView('bookDetail'); }}
            />
            {/* Prototyp — vier Demo-Wurzeln (ك ت ب, د ر س, ع م ل, س ك ن). */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                onClick={() => openRootExplorer()}
                style={{
                  background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                }}
              >
                Wurzel-Explorer (Beta) →
              </button>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <button onClick={() => setView('books')} style={{ ...backBtn, marginBottom: '1rem' }}>
              ← Zurück
            </button>
            <div style={{ ...card, padding: '1.25rem 1.5rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, margin: '0 0 0.5rem' }}>
                Einstellungen
              </h2>
              <Settings
                retention={retention}
                newPerSession={newPerSession}
                onRetentionChange={handleRetentionChange}
                onNewPerSessionChange={handleNewPerSessionChange}
              />
              <BackupControls onExport={handleExport} onImport={handleImport} />
            </div>
          </>
        )}

        {view === 'bookDetail' && selectedBook && (
          <BookDetail
            book={selectedBook}
            progressMap={progressMap}
            onStart={startReview}
            onAddWord={() => setView('add')}
            onBulkAddWords={() => setView('bulkAdd')}
            onBack={() => setView('books')}
          />
        )}

        {view === 'review' && scope && (
          <ReviewSession
            scope={scope}
            scopeLabel={scopeLabel}
            progressMap={progressMap}
            customVocab={customVocab}
            harakat={harakat}
            newPerSession={newPerSession}
            onProgressChange={handleProgressChange}
            onExit={() => setView('bookDetail')}
            onExploreRoot={openRootExplorer}
          />
        )}

        {view === 'add' && (
          <AddWord
            bookId={selectedBookId}
            units={selectedBook ? selectedBook.units : []}
            onSave={saveWord}
            onCancel={() => setView('bookDetail')}
          />
        )}

        {view === 'bulkAdd' && (
          <BulkAddWords
            bookId={selectedBookId}
            units={selectedBook ? selectedBook.units : []}
            onSave={saveBulkWords}
            onCancel={() => setView('bookDetail')}
          />
        )}
      </div>

      {/* Overlay statt View — läuft eine Review-Session, bleibt sie beim
          Öffnen des Explorers gemountet und macht beim Schliessen genau
          dort weiter. Breitere Bühne (1080) als der Rest der App: der
          Explorer nutzt auf Desktop ein Zwei-Spalten-Layout. */}
      {explorer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20, overflowY: 'auto',
          backgroundColor: C.bg, fontFamily: 'Inter, sans-serif', color: C.text,
          padding: '1.5rem 1.5rem 3rem',
        }}>
          <div style={{ maxWidth: 1080, margin: '0 auto' }}>
            <RootExplorer
              initialRootKey={explorer.rootKey}
              initialCenterAr={explorer.ar}
              customVocab={customVocab}
              onLearnWord={learnWordFromExplorer}
              onBack={() => setExplorer(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
