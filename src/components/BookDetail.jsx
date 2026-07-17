import { useMemo } from 'react';
import { ArrowLeft, BookOpen, Plus, Play, ListPlus } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { C, card, linkBtn, backBtn, pill, FONT, SPACE } from '../theme.js';

// One book's chapters and actions — reached from BookList. "Ganzes Buch
// üben" and each chapter row hand a scope off to ReviewSession via onStart.
export default function BookDetail({ book, progressMap, onStart, onAddWord, onBulkAddWords, onBack }) {
  const bookItems = useMemo(() => book.units.flatMap((u) => u.items), [book]);
  const bookCounts = useMemo(() => countDueFresh(bookItems, progressMap), [bookItems, progressMap]);

  return (
    <div>
      <button onClick={onBack} style={{ ...backBtn, marginBottom: 14 }}>
        <ArrowLeft size={15} /> Bücher
      </button>

      <div style={{ ...card, padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div dir="rtl" lang="ar" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arMd, lineHeight: 1.25 }}>
              {book.title} <span lang="de" style={{ fontSize: FONT.arXs, color: C.textSoft }}>· {book.subtitle}</span>
            </div>
            <div style={{ fontSize: FONT.sm, color: C.textSoft, marginTop: 2 }}>{book.titleDe}</div>
            <div style={{ fontSize: FONT.sm, color: C.textSoft, marginTop: 4 }}>{book.descDe}</div>
          </div>
          <span style={pill(book.accent)}>{book.level}</span>
        </div>

        <button
          onClick={() => onStart({ bookId: book.id })}
          style={{
            marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: book.accent, color: '#FFFFFF', border: 'none', borderRadius: 10,
            padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: FONT.base, fontWeight: 500,
          }}
        >
          <BookOpen size={15} />
          Ganzes Buch üben
          {(bookCounts.due > 0 || bookCounts.fresh > 0) && (
            <span style={{ opacity: 0.85, fontWeight: 400 }}>· {bookCounts.due} fällig, {bookCounts.fresh} neu</span>
          )}
        </button>

        <div style={{ marginTop: SPACE.md, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {book.units.map((u) => {
            const uc = countDueFresh(u.items, progressMap);
            return (
              <button
                key={u.id}
                onClick={() => onStart({ bookId: book.id, unitId: u.id })}
                aria-label={`${u.titleDe} üben`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  minHeight: 44, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '8px 8px 8px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: FONT.base, color: C.text }}>{u.titleDe}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: FONT.xs, color: C.textSoft }}>
                    {u.items.length} Wörter{uc.due > 0 ? ` · ${uc.due} fällig` : ''}
                  </span>
                  <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 999, backgroundColor: C.primarySoft, flexShrink: 0,
                  }}>
                    <Play size={12} color={C.primary} fill={C.primary} style={{ marginLeft: 1 }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: SPACE.md, display: 'flex', gap: 16 }}>
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
