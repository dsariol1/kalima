import { ChevronRight } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { C } from '../theme.js';

// Landing screen: just the books. Chapter detail and actions live one level
// deeper in BookDetail, so this stays a single decision (which book), not a
// wall of every chapter across every book at once.
export default function BookList({ tree, progressMap, onSelectBook }) {
  return (
    <div>
      {tree.map((book) => {
        const items = book.units.flatMap((u) => u.items);
        const { due, fresh } = countDueFresh(items, progressMap);
        return (
          <button
            key={book.id}
            onClick={() => onSelectBook(book.id)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', fontFamily: 'inherit',
              border: `1px solid ${C.hairline}`, borderRadius: 14,
              backgroundColor: C.parchment, padding: '1.1rem 1.25rem', marginBottom: '1rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 22, lineHeight: 1.25, color: C.ink }}>
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

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: C.inkSoft }}>
                {items.length} Wörter
                {(due > 0 || fresh > 0) && ` · ${due} fällig, ${fresh} neu`}
              </span>
              <ChevronRight size={16} color={C.inkSoft} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
