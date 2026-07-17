import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useReview } from '../hooks/useReview.js';
import { vocabForScope } from '../data/books.js';
import { RATINGS } from '../srs/scheduler.js';
import Flashcard from './Flashcard.jsx';
import GradeButtons from './GradeButtons.jsx';
import ProgressBar from './ProgressBar.jsx';
import { C, card, backBtn, primaryBtn, FONT, SPACE } from '../theme.js';

const FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

// A running review session for one scope. Owns nothing about scheduling —
// that all lives in useReview / the scheduler wrapper.
export default function ReviewSession({ scope, scopeLabel, exitLabel, progressMap, customVocab, harakat, newPerSession, onProgressChange, onExit, onExploreRoot }) {
  const { current, direction, currentCard, revealed, reveal, grade, stats, remaining, total, done } = useReview({
    scope, progressMap, customVocab, onProgressChange, newPerSession,
  });
  // Lives here (not in Flashcard, which remounts per card) so it stays open
  // across production cards within a session instead of resetting each time.
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Root-family siblings for the current card, within the whole app's vocab.
  const scopeVocab = useMemo(() => vocabForScope({ bookId: scope.bookId }, customVocab), [scope.bookId, customVocab]);
  const family = useMemo(() => {
    if (!current || !current.root) return [];
    const key = current.root.join('');
    return scopeVocab.filter((v) => v.id !== current.id && v.root && v.root.join('') === key);
  }, [current, scopeVocab]);

  // Anki-Konvention: Leertaste deckt auf, 1/2 bewerten. Nur bei der
  // Erkennen-Richtung — bei Produzieren tippt man in ein fokussiertes
  // Eingabefeld, das Leerzeichen/Ziffern selbst braucht (Enter prüft dort
  // bereits die Antwort). FIELD_TAGS blendet die Shortcuts zusätzlich aus,
  // solange irgendein Eingabefeld fokussiert ist.
  useEffect(() => {
    if (!current) return;
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (FIELD_TAGS.has(document.activeElement?.tagName)) return;
      if (!revealed) {
        if (e.key === ' ' && direction === 'recognition') {
          e.preventDefault();
          reveal();
        }
        return;
      }
      if (e.key === '1') { e.preventDefault(); grade(RATINGS[0].grade); }
      else if (e.key === '2') { e.preventDefault(); grade(RATINGS[1].grade); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, direction, revealed, reveal, grade]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button onClick={onExit} style={{ ...backBtn, flexShrink: 0 }}>
          <ArrowLeft size={15} /> {exitLabel || 'Zurück'}
        </button>
        <span style={{
          fontSize: FONT.sm, color: C.textSoft, flex: 1, minWidth: 0, textAlign: 'right',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {scopeLabel}
        </span>
      </div>

      {!done && current ? (
        <>
          <ProgressBar pct={total > 0 ? (total - remaining) / total : 0} />
          <div style={{ fontSize: FONT.xs, color: C.textSoft, textAlign: 'center', marginTop: 8, marginBottom: SPACE.sm }}>
            noch {remaining} · {stats.reviewed} wiederholt
          </div>
          <Flashcard
            key={`${current.id}:${direction}`}
            card={current} direction={direction} harakat={harakat} revealed={revealed} onReveal={reveal} family={family}
            showKeyboard={showKeyboard} onToggleKeyboard={() => setShowKeyboard((s) => !s)}
            onExploreRoot={onExploreRoot}
          />
          {revealed && <GradeButtons card={currentCard} onGrade={grade} />}
        </>
      ) : (
        <div style={{ ...card, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Sparkles size={22} color={C.gold} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: SPACE.sm }}>Runde abgeschlossen</div>
          <div style={{ fontSize: FONT.base, color: C.textSoft }}>
            {stats.reviewed} Karten geübt
            {stats.again > 0
              ? ` · ${stats.reviewed - stats.again} gewusst, ${stats.again}× nochmal`
              : ' · alle gewusst'}
            .
          </div>
          <button onClick={onExit} style={{ ...primaryBtn, marginTop: 16 }}>
            Zurück zum Buch
          </button>
        </div>
      )}
    </div>
  );
}
