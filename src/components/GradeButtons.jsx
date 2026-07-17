import { RATINGS, previewDueDates } from '../srs/scheduler.js';
import { formatInterval } from '../utils/interval.js';
import { C, FONT } from '../theme.js';

const STYLE = {
  again: { color: C.danger, bg: C.dangerSoft },
  good: { color: C.primary, bg: C.primarySoft },
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
          aria-label={`${r.label}, nächste Wiederholung in ${formatInterval(new Date(previews[r.key]).getTime() - now)}`}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            border: 'none', borderRadius: 12,
            backgroundColor: STYLE[r.key].bg, color: STYLE[r.key].color,
            cursor: 'pointer', padding: '14px 8px', fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: FONT.base, fontWeight: 600 }}>{r.label}</span>
          <span style={{ fontSize: FONT.xs, opacity: 0.75 }}>
            {formatInterval(new Date(previews[r.key]).getTime() - now)}
          </span>
        </button>
      ))}
    </div>
  );
}
