import { C } from '../theme.js';

// Dünner Fortschrittsbalken für Review- und Quiz-Runden. `pct` 0..1.
export default function ProgressBar({ pct }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: 4, borderRadius: 999, backgroundColor: C.surfaceMuted, overflow: 'hidden' }}
    >
      <div className="progress-bar-fill" style={{
        height: '100%', width: `${clamped * 100}%`, borderRadius: 999,
        backgroundColor: C.primary,
      }} />
    </div>
  );
}
