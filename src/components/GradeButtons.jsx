import { RATINGS, previewDueDates } from '../srs/scheduler.js';
import { formatInterval } from '../utils/interval.js';
import { C } from '../theme.js';

const STYLE = {
  again: { color: '#9C4A3C', bg: '#F3E4DF' },
  hard: { color: '#6B6558', bg: '#EBE6D8' },
  good: { color: '#3E6259', bg: '#DEEAE4' },
  easy: { color: '#9C7A3C', bg: '#F1E4C9' },
};

// Four grade buttons, each labelled with the interval that grade would produce.
export default function GradeButtons({ card, onGrade }) {
  const previews = previewDueDates(card);
  const now = Date.now();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {RATINGS.map((r) => (
        <button
          key={r.key}
          onClick={() => onGrade(r.grade)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            border: `1px solid ${C.hairline}`, borderRadius: 10,
            backgroundColor: STYLE[r.key].bg, color: STYLE[r.key].color,
            cursor: 'pointer', padding: '8px 4px', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</span>
          <span style={{ fontSize: 11, opacity: 0.75 }}>
            {formatInterval(new Date(previews[r.key]).getTime() - now)}
          </span>
        </button>
      ))}
    </div>
  );
}
