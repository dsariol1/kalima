import { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { buildBookTree } from './data/books.js';
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
import { C } from './theme.js';

// Top-level state machine: 'books' (landing) -> 'bookDetail' (one book's
// chapters) -> 'review' | 'add' | 'bulkAdd'. Loads progress and custom vocab
// from IndexedDB once, then hands slices to each screen.
export default function App() {
  const [progressMap, setProgressMap] = useState(null);
  const [customVocab, setCustomVocab] = useState([]);
  const [harakat, setHarakat] = useState(true);
  const [view, setView] = useState('books');
  const [scope, setScope] = useState(null);
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
    return <div style={{ fontFamily: 'Inter, sans-serif', color: C.inkSoft, padding: '3rem', textAlign: 'center' }}>Lade …</div>;
  }

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif', backgroundColor: C.parchmentLight, minHeight: '100vh',
      color: C.ink, padding: '1.5rem 1rem 3rem',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${C.hairline}`, paddingBottom: '0.85rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <BookOpen size={20} color={C.gold} />
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600 }}>فُصحى</span>
            <span style={{ fontSize: 14, color: C.inkSoft }}>Wortschatz</span>
          </div>
          <button
            onClick={() => setHarakat((h) => !h)}
            style={{
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500,
              background: harakat ? C.parchmentDeep : 'transparent',
              border: `1px solid ${C.hairline}`, borderRadius: 20, padding: '4px 10px',
              color: C.inkSoft, cursor: 'pointer',
            }}
          >
            Harakat {harakat ? 'an' : 'aus'}
          </button>
        </header>

        {view === 'books' && (
          <>
            <BookList
              tree={tree}
              progressMap={progressMap}
              onSelectBook={(bookId) => { setSelectedBookId(bookId); setView('bookDetail'); }}
            />
            <Settings
              retention={retention}
              newPerSession={newPerSession}
              onRetentionChange={handleRetentionChange}
              onNewPerSessionChange={handleNewPerSessionChange}
            />
            <BackupControls onExport={handleExport} onImport={handleImport} />
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
    </div>
  );
}
