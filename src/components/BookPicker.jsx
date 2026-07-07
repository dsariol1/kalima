import { useMemo } from 'react';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';
import { cardId, isUnlocked } from '../srs/cards.js';
import { C } from '../theme.js';

// Landing screen: pick a book, then a whole book or a single unit to review.
// Each unit shows how many cards (recognition + production) are due and new.
export default function BookPicker({ tree, progressMap, onStart, onAddWord }) {
  const now = Date.now();

  const counts = useMemo(() => {
    const fn = (items) => {
      let due = 0, fresh = 0;
      for (const v of items) {
        const recProgress = progressMap[cardId(v.id, 'recognition')];
        for (const direction of ['recognition', 'production']) {
          if (direction === 'production' && !isUnlocked('production', recProgress)) continue;
          const p = progressMap[cardId(v.id, direction)];
          if (!p) fresh += 1;
          else if (new Date(p.due).getTime() <= now) due += 1;
        }
      }
      return { due, fresh };
    };
    return fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressMap]);

  return (
    <div>
      {tree.map((book) => {
        const bookItems = book.units.flatMap((u) => u.items);
        const bc = counts(bookItems);
        return (
          <div
            key={book.id}
            style={{
              border: `1px solid ${C.hairline}`, borderRadius: 14,
              backgroundColor: C.parchment, padding: '1.1rem 1.25rem', marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 22, lineHeight: 1.25 }}>
                  {book.title} <span style={{ fontSize: 15, color: C.inkSoft }}>· {book.subtitle}</span>
                </div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{book.titleDe}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>{book.descDe}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 500, color: book.accent,
                border: `1px solid ${book.accent}`, borderRadius: 20, padding: '2px 9px', whiteSpace: 'nowrap',
              }}>{book.level}</span>
            </div>

            <button
              onClick={() => onStart({ bookId: book.id })}
              style={{
                marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: book.accent, color: '#F8F2E3', border: 'none', borderRadius: 8,
                padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
              }}
            >
              <BookOpen size={15} />
              Ganzes Buch üben
              {(bc.due > 0 || bc.fresh > 0) && (
                <span style={{ opacity: 0.85, fontWeight: 400 }}>· {bc.due} fällig, {bc.fresh} neu</span>
              )}
            </button>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {book.units.map((u) => {
                const uc = counts(u.items);
                return (
                  <button
                    key={u.id}
                    onClick={() => onStart({ bookId: book.id, unitId: u.id })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: C.parchmentLight, border: `1px solid ${C.hairline}`, borderRadius: 8,
                      padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: C.ink }}>{u.titleDe}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: C.inkSoft }}>
                        {u.items.length} Wörter{uc.due > 0 ? ` · ${uc.due} fällig` : ''}
                      </span>
                      <ChevronRight size={15} color={C.inkSoft} />
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onAddWord(book.id)}
              style={{
                marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, padding: 0,
              }}
            >
              <Plus size={14} /> Eigenes Wort hinzufügen
            </button>
          </div>
        );
      })}
    </div>
  );
}
