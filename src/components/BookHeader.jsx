import { useLang } from '../i18n/i18n.jsx';
import { bookTitle, bookDesc } from '../i18n/content.js';
import { C, pill, FONT } from '../theme.js';

// Titelblock eines Buchs — identisch in BookList (Kartenvorschau) und
// BookDetail (Kopf der Detailseite), deshalb hier einmal gepflegt.
export default function BookHeader({ book }) {
  const lang = useLang();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <div>
        <div dir="rtl" lang="ar" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arMd, lineHeight: 1.25, color: C.text }}>
          {book.title} <span style={{ fontSize: FONT.arXs, color: C.textSoft }}>· {book.subtitle}</span>
        </div>
        <div style={{ fontSize: FONT.sm, color: C.textSoft, marginTop: 2 }}>{bookTitle(book, lang)}</div>
        <div style={{ fontSize: FONT.sm, color: C.textSoft, marginTop: 4 }}>{bookDesc(book, lang)}</div>
      </div>
      <span style={pill(book.accent)}>{book.level}</span>
    </div>
  );
}
