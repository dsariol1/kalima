import { RATINGS, previewDueDates } from '../srs/scheduler.js';
import { formatInterval } from '../utils/interval.js';
import { C } from '../theme.js';

const STYLE = {
  again: { color: '#9C4A3C', bg: '#F3E4DF' },
  good: { color: '#3E6259', bg: '#DEEAE4' },
};

// Binary pass/fail: left = wrong/unsure (schedules again soon), right =
// correct and know it (schedules further out). Each labelled with the
// interval that choice would produce.
export default function GradeButtons({ card, onGrade }) {
  const previews = previewDueDates(card);
  const now = Date.now();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {RATINGS.map((r) => (
        <button
          key={r.key}
          onClick={() => onGrade(r.grade)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            border: `1px solid ${C.hairline}`, borderRadius: 10,
            backgroundColor: STYLE[r.key].bg, color: STYLE[r.key].color,
            cursor: 'pointer', padding: '14px 8px', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{r.label}</span>
          <span style={{ fontSize: 11.5, opacity: 0.75 }}>
            {formatInterval(new Date(previews[r.key]).getTime() - now)}
          </span>
        </button>
      ))}
    </div>
  );
}
