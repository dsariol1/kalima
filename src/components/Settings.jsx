import { C } from '../theme.js';

const RETENTION_MIN = 70;
const RETENTION_MAX = 97;
const NEW_PER_SESSION_MIN = 1;
const NEW_PER_SESSION_MAX = 50;

const label = { display: 'block', fontSize: 12.5, color: C.ink, marginBottom: 10 };
const rowValue = { color: C.inkSoft, fontWeight: 400 };

// User-tunable FSRS knobs. Persisted via setSetting in db.js; retention also
// needs to reach the scheduler itself (see App.jsx's onRetentionChange).
export default function Settings({ retention, newPerSession, onRetentionChange, onNewPerSessionChange }) {
  const retentionPct = Math.round(retention * 100);

  return (
    <div style={{
      marginTop: '1.5rem', borderTop: `1px solid ${C.hairline}`, paddingTop: '1rem',
    }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>Einstellungen</div>

      <label style={label}>
        Ziel-Behaltensrate <span style={rowValue}>· {retentionPct}%</span>
        <input
          type="range"
          min={RETENTION_MIN}
          max={RETENTION_MAX}
          step={1}
          value={retentionPct}
          onChange={(e) => onRetentionChange(Number(e.target.value) / 100)}
          style={{ width: '100%', marginTop: 6, accentColor: C.teal }}
        />
      </label>

      <label style={{ ...label, marginBottom: 0 }}>
        Neue Karten pro Sitzung <span style={rowValue}>(je Richtung)</span>
        <input
          type="number"
          min={NEW_PER_SESSION_MIN}
          max={NEW_PER_SESSION_MAX}
          value={newPerSession}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value));
            if (Number.isFinite(n)) {
              onNewPerSessionChange(Math.min(NEW_PER_SESSION_MAX, Math.max(NEW_PER_SESSION_MIN, n)));
            }
          }}
          style={{
            display: 'block', marginTop: 6, width: 80, fontFamily: 'inherit', fontSize: 13.5,
            border: `1px solid ${C.hairline}`, borderRadius: 8, padding: '6px 10px',
            background: C.parchmentLight, color: C.ink,
          }}
        />
      </label>
    </div>
  );
}
