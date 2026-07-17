import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useReview } from '../hooks/useReview.js';
import { vocabForScope } from '../data/books.js';
import Flashcard from './Flashcard.jsx';
import GradeButtons from './GradeButtons.jsx';
import { C, card, backBtn, primaryBtn, FONT, SPACE } from '../theme.js';

// A running review session for one scope. Owns nothing about scheduling —
// that all lives in useReview / the scheduler wrapper.
export default function ReviewSession({ scope, scopeLabel, exitLabel, progressMap, customVocab, harakat, newPerSession, onProgressChange, onExit, onExploreRoot }) {
  const { current, direction, currentCard, revealed, reveal, grade, stats, remaining, done } = useReview({
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
          <div style={{ fontSize: FONT.xs, color: C.textSoft, textAlign: 'center', marginBottom: SPACE.sm }}>
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
            {stats.reviewed} Karten{stats.again > 0 ? `, ${stats.again}× nochmal geübt` : ''}.
          </div>
          <button onClick={onExit} style={{ ...primaryBtn, marginTop: 16 }}>
            Zurück zum Buch
          </button>
        </div>
      )}
    </div>
  );
}
