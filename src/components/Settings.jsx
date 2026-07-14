import { C, inputStyle } from '../theme.js';

const RETENTION_MIN = 70;
const RETENTION_MAX = 97;
const NEW_PER_SESSION_MIN = 1;
const NEW_PER_SESSION_MAX = 50;

const label = { display: 'block', fontSize: 12.5, color: C.text, marginBottom: 10 };
const rowValue = { color: C.textSoft, fontWeight: 400 };

const THEME_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Hell' },
  { value: 'dark', label: 'Dunkel' },
];

// User-tunable FSRS knobs. Persisted via setSetting in db.js; retention also
// needs to reach the scheduler itself (see App.jsx's onRetentionChange).
export default function Settings({ retention, newPerSession, theme, onRetentionChange, onNewPerSessionChange, onThemeChange }) {
  const retentionPct = Math.round(retention * 100);

  return (
    // Leads inside the settings card (App.jsx renders the heading), so no
    // top divider of its own.
    <div style={{ paddingTop: '0.5rem' }}>
      <span style={label}>Darstellung</span>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {THEME_OPTIONS.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onThemeChange(opt.value)}
              style={{
                fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
                background: active ? C.primarySoft : 'transparent',
                border: `1px solid ${active ? C.primary : C.border}`, borderRadius: 999,
                padding: '5px 14px', color: active ? C.primary : C.textSoft, cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <label style={label}>
        Ziel-Behaltensrate <span style={rowValue}>· {retentionPct}%</span>
        <input
          type="range"
          min={RETENTION_MIN}
          max={RETENTION_MAX}
          step={1}
          value={retentionPct}
          onChange={(e) => onRetentionChange(Number(e.target.value) / 100)}
          style={{ width: '100%', marginTop: 6, accentColor: C.primary }}
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
          style={{ ...inputStyle, display: 'block', marginTop: 6, width: 80, fontSize: 13.5, padding: '6px 10px' }}
        />
      </label>
    </div>
  );
}
