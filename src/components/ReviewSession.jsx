import { useMemo } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useReview } from '../hooks/useReview.js';
import { vocabForScope } from '../data/books.js';
import Flashcard from './Flashcard.jsx';
import GradeButtons from './GradeButtons.jsx';
import { C } from '../theme.js';

// A running review session for one scope. Owns nothing about scheduling —
// that all lives in useReview / the scheduler wrapper.
export default function ReviewSession({ scope, scopeLabel, progressMap, customVocab, harakat, newPerSession, onProgressChange, onExit }) {
  const { current, direction, currentCard, revealed, reveal, grade, stats, remaining, done } = useReview({
    scope, progressMap, customVocab, onProgressChange, newPerSession,
  });

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
        <button
          onClick={onExit}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
            color: C.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}
        >
          <ArrowLeft size={15} /> Bücher
        </button>
        <span style={{ fontSize: 12.5, color: C.inkSoft }}>{scopeLabel}</span>
      </div>

      {!done && current ? (
        <>
          <div style={{ fontSize: 12, color: C.inkSoft, textAlign: 'center', marginBottom: 10 }}>
            noch {remaining} · {stats.reviewed} wiederholt
          </div>
          <Flashcard key={`${current.id}:${direction}`} card={current} direction={direction} harakat={harakat} revealed={revealed} onReveal={reveal} family={family} />
          {revealed && <GradeButtons card={currentCard} onGrade={grade} />}
        </>
      ) : (
        <div style={{ border: `1px solid ${C.hairline}`, borderRadius: 14, backgroundColor: C.parchment,
          padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <Sparkles size={22} color={C.gold} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, marginBottom: 8 }}>Runde abgeschlossen</div>
          <div style={{ fontSize: 13.5, color: C.inkSoft }}>
            {stats.reviewed} Karten{stats.again > 0 ? `, ${stats.again}× nochmal geübt` : ''}.
          </div>
          <button
            onClick={onExit}
            style={{ marginTop: 16, background: C.teal, color: '#F8F2E3', border: 'none', borderRadius: 8,
              padding: '9px 22px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500 }}
          >
            Zurück zu den Büchern
          </button>
        </div>
      )}
    </div>
  );
}
