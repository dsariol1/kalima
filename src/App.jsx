import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { buildBookTree } from './data/books.js';
import { cardId, countDueFresh, isUnlocked } from './srs/cards.js';
import { loadProgress, loadCustomVocab, addCustomVocab, addCustomVocabMany, exportAll, importAll, getSetting, setSetting, reviewsToday, currentStreak } from './db/db.js';
import { DEFAULT_RETENTION, setRetention as configureRetention } from './srs/scheduler.js';
import { DEFAULT_NEW_PER_SESSION } from './hooks/useReview.js';
import Dashboard from './components/Dashboard.jsx';
import QuizSession from './components/QuizSession.jsx';
import BookList from './components/BookList.jsx';
import BookDetail from './components/BookDetail.jsx';
import ReviewSession from './components/ReviewSession.jsx';
import AddWord from './components/AddWord.jsx';
import BulkAddWords from './components/BulkAddWords.jsx';
import BackupControls from './components/BackupControls.jsx';
import Settings from './components/Settings.jsx';
import RootExplorer from './components/RootExplorer.jsx';
import Login from './components/Login.jsx';
import { pb, logout, changePassword } from './auth/pocketbase.js';
import { useSync } from './hooks/useSync.js';
import { LangProvider, DEFAULT_LANG, makeT } from './i18n/i18n.jsx';
import { bookTitle } from './i18n/content.js';
import { C, card, backBtn, FONT, SPACE } from './theme.js';

// Top-level state machine: 'home' (Dashboard mit Lernwerkzeugen) ->
// 'books' (Karteikarten-Tool) -> 'bookDetail' -> 'review' | 'add' | 'bulkAdd';
// 'home' -> 'quiz'; 'settings' is reached via the header gear (nur auf 'home').
// Loads progress and custom vocab from IndexedDB once, then hands slices to
// each screen.
export default function App() {
  const [progressMap, setProgressMap] = useState(null);
  const [customVocab, setCustomVocab] = useState([]);
  const [harakat, setHarakat] = useState(true);
  const [view, setView] = useState('home');
  const [scope, setScope] = useState(null);
  // Overlay statt eigener View: bleibt unabhängig davon offenbar/schliessbar,
  // welche View gerade aktiv ist — insbesondere darf eine laufende
  // ReviewSession beim Öffnen nicht unmounten (sonst geht der Fortschritt
  // der aktuellen Runde verloren).
  const [explorer, setExplorer] = useState(null); // { rootKey, ar } | null
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [retention, setRetentionState] = useState(DEFAULT_RETENTION);
  const [newPerSession, setNewPerSession] = useState(DEFAULT_NEW_PER_SESSION);
  const [doneToday, setDoneToday] = useState(0);
  const [streak, setStreak] = useState(0);
  // 'system' | 'light' | 'dark'. 'system' sets no override — the CSS
  // prefers-color-scheme media query in index.css decides. Applied to
  // <html data-theme> so it wins the cascade over the media query.
  const [theme, setThemeState] = useState('system');
  // Anzeigesprache 'de' | 'en'. Schaltet UI-Chrome UND Bedeutungssprache der
  // Vokabeln (ein Schalter für beides). Persistiert wie theme.
  const [lang, setLangState] = useState(DEFAULT_LANG);
  // Pflicht-Login: bis ein gültiger Auth-Token da ist, rendert nur der
  // Login-Screen. pb.authStore ist über Dexie persistiert (auth/pocketbase.js).
  const [authed, setAuthed] = useState(pb.authStore.isValid);

  // Kompletter Zustand aus Dexie. Wird beim Mount geladen und nach einem Sync,
  // der Remote-Änderungen gezogen hat, erneut ausgeführt (onSynced).
  const loadAll = useCallback(async () => {
    const [p, c, r, n, t, h, l] = await Promise.all([
      loadProgress(),
      loadCustomVocab(),
      getSetting('retention', DEFAULT_RETENTION),
      getSetting('newPerSession', DEFAULT_NEW_PER_SESSION),
      getSetting('theme', 'system'),
      getSetting('harakat', true),
      getSetting('lang', DEFAULT_LANG),
    ]);
    setProgressMap(p);
    setCustomVocab(c);
    setRetentionState(r);
    setNewPerSession(n);
    configureRetention(r);
    setThemeState(t);
    setHarakat(h);
    setLangState(l);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auth-Zustand an das SDK koppeln (Login, Logout, Token-Ablauf).
  useEffect(() => pb.authStore.onChange(() => setAuthed(pb.authStore.isValid)), []);

  // Hintergrund-Sync, sobald eingeloggt. Zieht Pull Änderungen, lädt loadAll neu.
  const sync = useSync({ enabled: authed, onSynced: loadAll });

  useEffect(() => {
    if (theme === 'system') {
      delete document.documentElement.dataset.theme;
      // Zwei media-gebundene theme-color-Tags in index.html übernehmen wieder.
      document.querySelectorAll('meta[name="theme-color"][data-override]').forEach((m) => m.remove());
    } else {
      document.documentElement.dataset.theme = theme;
      // Expliziter Override braucht ein eigenes, medienloses Tag — die
      // beiden statischen Tags reagieren nur auf prefers-color-scheme.
      let meta = document.querySelector('meta[name="theme-color"][data-override]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.dataset.override = 'true';
        document.head.appendChild(meta);
      }
      meta.content = theme === 'dark' ? '#10201C' : '#F6F8F7';
    }
  }, [theme]);

  const tree = useMemo(() => buildBookTree(customVocab), [customVocab]);

  const allItems = useMemo(() => tree.flatMap((b) => b.units.flatMap((u) => u.items)), [tree]);

  // Today's totals across all books for the dashboard stat card. Same
  // countDueFresh the per-book badges use — no separate due logic.
  const todayTotals = useMemo(() => {
    if (!progressMap) return { due: 0, fresh: 0 };
    return countDueFresh(allItems, progressMap);
  }, [allItems, progressMap]);

  // Gleiches Gating wie QuizSession: Recognition-Karte mindestens einmal
  // bewertet. Nur fürs Dashboard-Badge — die Quiz-Logik selbst bleibt dort.
  const quizPoolSize = useMemo(() => {
    if (!progressMap) return 0;
    return allItems.filter((v) => isUnlocked('production', progressMap[cardId(v.id, 'recognition')])).length;
  }, [allItems, progressMap]);

  // Ring + Streak bei jeder Rückkehr auf die Startseite neu laden — nach
  // einer Review-Runde wären die Mount-Werte sonst eingefroren.
  useEffect(() => {
    if (view !== 'home') return;
    (async () => {
      const [d, s] = await Promise.all([reviewsToday(), currentStreak()]);
      setDoneToday(d);
      setStreak(s);
    })();
  }, [view]);

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
      const unitTitle = (lang === 'en' ? (u?.titleEn ?? u?.titleDe) : u?.titleDe) || '';
      return `${bookTitle(book, lang)} · ${unitTitle}`;
    }
    return bookTitle(book, lang);
  }, [scope, tree, lang]);

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

  const handleThemeChange = useCallback((t) => {
    setThemeState(t);
    setSetting('theme', t);
  }, []);

  const handleLangChange = useCallback((l) => {
    setLangState(l);
    setSetting('lang', l);
  }, []);

  const handleHarakatChange = useCallback(() => {
    setHarakat((h) => {
      setSetting('harakat', !h);
      return !h;
    });
  }, []);

  // Pflicht-Gate: ohne Anmeldung nichts als der Login-Screen. Steht bewusst vor
  // dem Lade-Guard — alles darunter läuft nur authentifiziert (keine dualen
  // Gast-/Konto-Pfade).
  const { t } = makeT(lang);

  if (!authed) {
    return <LangProvider lang={lang}><Login /></LangProvider>;
  }

  if (progressMap === null) {
    return <AppSkeleton />;
  }

  return (
    <LangProvider lang={lang}>
    <div style={{
      fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh',
      color: C.text, padding: '1.5rem 1rem 3rem',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '0.85rem', marginBottom: '1.5rem',
        }}>
          {/* Text-Wortmarke in der Display-Schrift der Begrüßung; das
              goldene Plus ist das Markenzeichen. */}
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.h2, fontWeight: 700, color: C.text, lineHeight: 1 }}>
            Kalima<span style={{ color: C.gold }}>+</span>
          </div>
          {/* Harakat toggle only matters while a word is being quizzed. */}
          {view === 'review' && (
            <button
              onClick={handleHarakatChange}
              aria-pressed={harakat}
              style={{
                fontFamily: 'inherit', fontSize: FONT.xs, fontWeight: 500,
                background: harakat ? C.primarySoft : 'transparent',
                border: `1px solid ${harakat ? C.primary : C.border}`, borderRadius: 999, padding: '6px 12px',
                color: harakat ? C.primary : C.textSoft, cursor: 'pointer', minHeight: 32,
              }}
            >
              {harakat ? t('header.harakatOn') : t('header.harakatOff')}
            </button>
          )}
          {view === 'home' && (
            <button
              onClick={() => setView('settings')}
              aria-label={t('header.settingsAria')}
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

        {view === 'home' && (
          <Dashboard
            todayTotals={todayTotals}
            doneToday={doneToday}
            streak={streak}
            quizPoolSize={quizPoolSize}
            onOpenFlashcards={() => setView('books')}
            onOpenQuiz={() => setView('quiz')}
            onOpenExplorer={() => openRootExplorer()}
          />
        )}

        {view === 'books' && (
          <>
            <button onClick={() => setView('home')} style={{ ...backBtn, marginBottom: '1rem' }}>
              <ArrowLeft size={15} /> {t('common.start')}
            </button>
            <div style={{ fontSize: FONT.sm, fontWeight: 500, color: C.textSoft, marginBottom: SPACE.sm }}>{t('nav.books')}</div>
            <BookList
              tree={tree}
              progressMap={progressMap}
              onSelectBook={(bookId) => { setSelectedBookId(bookId); setView('bookDetail'); }}
            />
          </>
        )}

        {view === 'quiz' && (
          <QuizSession
            allItems={allItems}
            progressMap={progressMap}
            onExit={() => setView('home')}
            onGoFlashcards={() => setView('books')}
          />
        )}

        {view === 'settings' && (
          <>
            <button onClick={() => setView('home')} style={{ ...backBtn, marginBottom: '1rem' }}>
              <ArrowLeft size={15} /> {t('common.start')}
            </button>
            <div style={{ ...card, padding: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, fontWeight: 600, margin: '0 0 0.5rem' }}>
                {t('settings.heading')}
              </h2>
              <Settings
                retention={retention}
                newPerSession={newPerSession}
                theme={theme}
                lang={lang}
                onRetentionChange={handleRetentionChange}
                onNewPerSessionChange={handleNewPerSessionChange}
                onThemeChange={handleThemeChange}
                onLangChange={handleLangChange}
                syncStatus={sync.status}
                lastSyncedAt={sync.lastSyncedAt}
                userEmail={pb.authStore.record?.email}
                onLogout={logout}
                onChangePassword={pb.authStore.isValid ? changePassword : undefined}
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
            exitLabel={selectedBook ? bookTitle(selectedBook, lang) : t('common.book')}
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
            exitLabel={selectedBook ? bookTitle(selectedBook, lang) : t('common.book')}
            onSave={saveWord}
            onCancel={() => setView('bookDetail')}
          />
        )}

        {view === 'bulkAdd' && (
          <BulkAddWords
            bookId={selectedBookId}
            units={selectedBook ? selectedBook.units : []}
            exitLabel={selectedBook ? bookTitle(selectedBook, lang) : t('common.book')}
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
    </LangProvider>
  );
}

// Platzhalter in Form der Startseite (Titel + Statkarte + zwei Tool-Karten),
// solange loadAll() noch läuft — reserviert das Layout, damit beim
// Nachladen nichts springt (CLS), statt nur "Lade …" zu zeigen.
function SkeletonBlock({ style }) {
  return <div className="skeleton-pulse" style={{ backgroundColor: C.surfaceMuted, borderRadius: 8, ...style }} />;
}

function AppSkeleton() {
  return (
    <div style={{
      fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh',
      padding: '1.5rem 1rem 3rem',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`, paddingBottom: '0.85rem', marginBottom: '1.5rem',
        }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.h2, fontWeight: 700, color: C.textSoft, lineHeight: 1 }}>
            Kalima+
          </div>
        </div>
        <SkeletonBlock style={{ width: 160, height: 28, marginBottom: SPACE.lg }} />
        <SkeletonBlock style={{ ...card, height: 88, marginBottom: SPACE.xl, boxShadow: 'none' }} />
        <SkeletonBlock style={{ width: 100, height: 14, marginBottom: SPACE.sm }} />
        <SkeletonBlock style={{ ...card, height: 74, marginBottom: SPACE.md, boxShadow: 'none' }} />
        <SkeletonBlock style={{ ...card, height: 74, boxShadow: 'none' }} />
      </div>
    </div>
  );
}
