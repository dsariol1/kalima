import { useMemo } from 'react';
import { ArrowLeft, BookOpen, Plus, ChevronRight, ListPlus } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { C } from '../theme.js';

// One book's chapters and actions — reached from BookList. "Ganzes Buch
// üben" and each chapter row hand a scope off to ReviewSession via onStart.
export default function BookDetail({ book, progressMap, onStart, onAddWord, onBulkAddWords, onBack }) {
  const bookItems = useMemo(() => book.units.flatMap((u) => u.items), [book]);
  const bookCounts = useMemo(() => countDueFresh(bookItems, progressMap), [bookItems, progressMap]);

  const linkBtn = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, padding: 0,
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: C.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Bücher
      </button>

      <div style={{
        border: `1px solid ${C.hairline}`, borderRadius: 14,
        backgroundColor: C.parchment, padding: '1.1rem 1.25rem',
      }}>
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
          {(bookCounts.due > 0 || bookCounts.fresh > 0) && (
            <span style={{ opacity: 0.85, fontWeight: 400 }}>· {bookCounts.due} fällig, {bookCounts.fresh} neu</span>
          )}
        </button>

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {book.units.map((u) => {
            const uc = countDueFresh(u.items, progressMap);
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

        <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
          <button onClick={onAddWord} style={linkBtn}>
            <Plus size={14} /> Eigenes Wort hinzufügen
          </button>
          <button onClick={onBulkAddWords} style={linkBtn}>
            <ListPlus size={14} /> Vokabelliste einfügen
          </button>
        </div>
      </div>
    </div>
  );
}
