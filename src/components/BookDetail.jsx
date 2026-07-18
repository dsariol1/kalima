import { useMemo } from 'react';
import { ArrowLeft, BookOpen, Plus, Play, ListPlus } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { useT, useLang } from '../i18n/i18n.jsx';
import { C, card, linkBtn, backBtn, FONT, SPACE } from '../theme.js';
import BookHeader from './BookHeader.jsx';

// One book's chapters and actions — reached from BookList. "Ganzes Buch
// üben" and each chapter row hand a scope off to ReviewSession via onStart.
export default function BookDetail({ book, progressMap, onStart, onAddWord, onBulkAddWords, onBack }) {
  const { t, tn } = useT();
  const lang = useLang();
  const unitTitle = (u) => (lang === 'en' ? (u.titleEn ?? u.titleDe) : u.titleDe);
  const bookItems = useMemo(() => book.units.flatMap((u) => u.items), [book]);
  const bookCounts = useMemo(() => countDueFresh(bookItems, progressMap), [bookItems, progressMap]);

  return (
    <div>
      <button onClick={onBack} style={{ ...backBtn, marginBottom: 14 }}>
        <ArrowLeft size={15} /> {t('nav.books')}
      </button>

      <div style={{ ...card, padding: '1rem 1.25rem' }}>
        <BookHeader book={book} />

        <button
          onClick={() => onStart({ bookId: book.id })}
          style={{
            marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: book.accent, color: '#FFFFFF', border: 'none', borderRadius: 10,
            padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: FONT.base, fontWeight: 500,
          }}
        >
          <BookOpen size={15} />
          {t('bookDetail.wholeBook')}
          {(bookCounts.due > 0 || bookCounts.fresh > 0) && (
            <span style={{ opacity: 0.85, fontWeight: 400 }}>{t('bookDetail.wholeBookCounts', { due: bookCounts.due, fresh: bookCounts.fresh })}</span>
          )}
        </button>

        <div style={{ marginTop: SPACE.md, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {book.units.map((u) => {
            const uc = countDueFresh(u.items, progressMap);
            return (
              <button
                key={u.id}
                onClick={() => onStart({ bookId: book.id, unitId: u.id })}
                aria-label={t('bookDetail.unitPracticeAria', { unit: unitTitle(u) })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  minHeight: 44, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: '8px 8px 8px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: FONT.base, color: C.text }}>{unitTitle(u)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: FONT.xs, color: C.textSoft }}>
                    {tn('common.words', u.items.length)}{uc.due > 0 ? t('bookDetail.unitDueSuffix', { due: uc.due }) : ''}
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
            <Plus size={14} /> {t('bookDetail.addWord')}
          </button>
          <button onClick={onBulkAddWords} style={linkBtn}>
            <ListPlus size={14} /> {t('bookDetail.pasteList')}
          </button>
        </div>
      </div>
    </div>
  );
}
