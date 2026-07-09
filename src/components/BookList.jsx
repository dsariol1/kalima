import { ChevronRight } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { C, card, pill } from '../theme.js';

// Landing screen: just the books. Chapter detail and actions live one level
// deeper in BookDetail, so this stays a single decision (which book), not a
// wall of every chapter across every book at once.
export default function BookList({ tree, progressMap, onSelectBook }) {
  return (
    <div>
      {tree.filter((book) => book.total > 0).map((book) => {
        const items = book.units.flatMap((u) => u.items);
        const { due, fresh } = countDueFresh(items, progressMap);
        return (
          <button
            key={book.id}
            onClick={() => onSelectBook(book.id)}
            style={{
              ...card,
              display: 'block', width: '100%', textAlign: 'left', fontFamily: 'inherit',
              padding: '1.1rem 1.25rem', marginBottom: '1rem', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 22, lineHeight: 1.25, color: C.text }}>
                  {book.title} <span style={{ fontSize: 15, color: C.textSoft }}>· {book.subtitle}</span>
                </div>
                <div style={{ fontSize: 13, color: C.textSoft, marginTop: 2 }}>{book.titleDe}</div>
                <div style={{ fontSize: 12.5, color: C.textSoft, marginTop: 4 }}>{book.descDe}</div>
              </div>
              <span style={pill(book.accent)}>{book.level}</span>
            </div>

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: C.textSoft }}>
                {items.length} Wörter
                {due > 0 && <span style={{ color: C.primary, fontWeight: 500 }}> · {due} fällig</span>}
                {fresh > 0 && ` · ${fresh} neu`}
              </span>
              <ChevronRight size={16} color={C.textSoft} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
