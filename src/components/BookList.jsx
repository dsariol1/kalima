import { BookX, ChevronRight } from 'lucide-react';
import { countDueFresh } from '../srs/cards.js';
import { useT } from '../i18n/i18n.jsx';
import { C, card, FONT, SPACE } from '../theme.js';
import BookHeader from './BookHeader.jsx';

// Landing screen: just the books. Chapter detail and actions live one level
// deeper in BookDetail, so this stays a single decision (which book), not a
// wall of every chapter across every book at once.
export default function BookList({ tree, progressMap, onSelectBook }) {
  const { t, tn } = useT();
  const books = tree.filter((book) => book.total > 0);

  if (books.length === 0) {
    return (
      <div style={{ ...card, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <BookX size={22} color={C.textSoft} style={{ marginBottom: 10 }} />
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: SPACE.sm }}>
          {t('books.noBooksTitle')}
        </div>
        <div style={{ fontSize: FONT.base, color: C.textSoft }}>
          {t('books.noBooksBody')}
        </div>
      </div>
    );
  }

  return (
    <div>
      {books.map((book) => {
        const items = book.units.flatMap((u) => u.items);
        const { due, fresh } = countDueFresh(items, progressMap);
        return (
          <button
            key={book.id}
            onClick={() => onSelectBook(book.id)}
            style={{
              ...card,
              display: 'block', width: '100%', textAlign: 'left', fontFamily: 'inherit',
              padding: '1rem 1.25rem', marginBottom: SPACE.md, cursor: 'pointer',
            }}
          >
            <BookHeader book={book} />

            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: FONT.sm, color: C.textSoft }}>
                {tn('common.words', items.length)}
                {due > 0 && <span style={{ color: C.primary, fontWeight: 500 }}>{t('books.dueSuffix', { due })}</span>}
                {fresh > 0 && t('books.freshSuffix', { fresh })}
              </span>
              <ChevronRight size={16} color={C.textSoft} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
