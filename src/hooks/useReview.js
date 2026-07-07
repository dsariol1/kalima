// Session engine. Given a scope (a whole book or a single unit), it builds a
// queue of due + new cards, tracks the current card, applies grades through
// the FSRS scheduler, and persists every change to IndexedDB.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { vocabForScope } from '../data/books.js';
import { newCard, review } from '../srs/scheduler.js';
import { cardId, isUnlocked } from '../srs/cards.js';
import { saveProgress, logReview } from '../db/db.js';

export const DEFAULT_NEW_PER_SESSION = 15; // cap on unseen cards introduced per session, per direction

export function useReview({ scope, progressMap, customVocab, onProgressChange, newPerSession = DEFAULT_NEW_PER_SESSION }) {
  const [queue, setQueue] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ reviewed: 0, again: 0 });
  // Local working copy of card state so we don't wait on Dexie between cards.
  // Keyed by the composite `${vocabId}::${direction}` id.
  const cardState = useRef({});

  const vocab = useMemo(
    () => vocabForScope(scope, customVocab),
    [scope, customVocab]
  );
  const vocabById = useMemo(() => {
    const m = {};
    for (const v of vocab) m[v.id] = v;
    return m;
  }, [vocab]);

  // Build the initial queue when the scope opens.
  useEffect(() => {
    const now = Date.now();
    cardState.current = {};
    const due = [];
    const freshRecognition = [];
    const freshProduction = [];
    for (const v of vocab) {
      const recProgress = progressMap[cardId(v.id, 'recognition')];
      for (const direction of ['recognition', 'production']) {
        if (direction === 'production' && !isUnlocked('production', recProgress)) continue;
        const entry = { vocabId: v.id, direction };
        const p = progressMap[cardId(v.id, direction)];
        if (!p) {
          (direction === 'recognition' ? freshRecognition : freshProduction).push(entry);
        } else {
          cardState.current[cardId(v.id, direction)] = p;
          if (new Date(p.due).getTime() <= now) due.push(entry);
        }
      }
    }
    setQueue([
      ...due,
      ...freshRecognition.slice(0, newPerSession),
      ...freshProduction.slice(0, newPerSession),
    ]);
    setStats({ reviewed: 0, again: 0 });
    setRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, vocab]);

  const currentEntry = queue[0] || null;
  const current = currentEntry ? vocabById[currentEntry.vocabId] : null;
  const direction = currentEntry?.direction || null;
  const currentCard = currentEntry
    ? cardState.current[cardId(currentEntry.vocabId, currentEntry.direction)] || newCard()
    : null;

  const grade = useCallback(
    async (ratingGrade) => {
      if (!currentEntry) return;
      const { vocabId, direction: dir } = currentEntry;
      const key = cardId(vocabId, dir);
      const prev = cardState.current[key] || newCard();
      const { card: next } = review(prev, ratingGrade);
      cardState.current[key] = next;

      const bookId = vocabById[vocabId]?.bookId;
      saveProgress(vocabId, dir, bookId, next);
      logReview(vocabId, dir, ratingGrade);
      onProgressChange?.(key, next);

      const isAgain = ratingGrade === 1; // Rating.Again
      setStats((s) => ({ reviewed: s.reviewed + 1, again: s.again + (isAgain ? 1 : 0) }));

      setQueue((q) => {
        const rest = q.slice(1);
        // If the card is due again very soon (learning step), requeue it a
        // few positions back so it recurs this session without repeating now.
        if (new Date(next.due).getTime() <= Date.now() + 60 * 1000) {
          const at = Math.min(rest.length, 3);
          const copy = rest.slice();
          copy.splice(at, 0, q[0]);
          return copy;
        }
        return rest;
      });
      setRevealed(false);
    },
    [currentEntry, vocabById, onProgressChange]
  );

  return {
    current,
    direction,
    currentCard,
    revealed,
    reveal: () => setRevealed(true),
    grade,
    stats,
    remaining: queue.length,
    done: queue.length === 0,
  };
}
