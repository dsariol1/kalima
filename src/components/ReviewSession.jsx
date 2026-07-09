import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useReview } from '../hooks/useReview.js';
import { vocabForScope } from '../data/books.js';
import Flashcard from './Flashcard.jsx';
import GradeButtons from './GradeButtons.jsx';
import { C, card, backBtn, primaryBtn } from '../theme.js';

// A running review session for one scope. Owns nothing about scheduling —
// that all lives in useReview / the scheduler wrapper.
export default function ReviewSession({ scope, scopeLabel, progressMap, customVocab, harakat, newPerSession, onProgressChange, onExit }) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button onClick={onExit} style={backBtn}>
          <ArrowLeft size={15} /> Bücher
        </button>
        <span style={{ fontSize: 12.5, color: C.textSoft }}>{scopeLabel}</span>
      </div>

      {!done && current ? (
        <>
          <div style={{ fontSize: 12, color: C.textSoft, textAlign: 'center', marginBottom: 10 }}>
            noch {remaining} · {stats.reviewed} wiederholt
          </div>
          <Flashcard
            key={`${current.id}:${direction}`}
            card={current} direction={direction} harakat={harakat} revealed={revealed} onReveal={reveal} family={family}
            showKeyboard={showKeyboard} onToggleKeyboard={() => setShowKeyboard((s) => !s)}
          />
          {revealed && <GradeButtons card={currentCard} onGrade={grade} />}
        </>
      ) : (
        <div style={{ ...card, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <Sparkles size={22} color={C.gold} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginBottom: 8 }}>Runde abgeschlossen</div>
          <div style={{ fontSize: 13.5, color: C.textSoft }}>
            {stats.reviewed} Karten{stats.again > 0 ? `, ${stats.again}× nochmal geübt` : ''}.
          </div>
          <button onClick={onExit} style={{ ...primaryBtn, marginTop: 16 }}>
            Zurück zu den Büchern
          </button>
        </div>
      )}
    </div>
  );
}
