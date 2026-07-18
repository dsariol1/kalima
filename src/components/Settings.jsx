import { C, inputStyle, linkBtn, FONT, SPACE } from '../theme.js';
import { useT } from '../i18n/i18n.jsx';

const RETENTION_MIN = 70;
const RETENTION_MAX = 97;
const NEW_PER_SESSION_MIN = 1;
const NEW_PER_SESSION_MAX = 50;

const label = { display: 'block', fontSize: FONT.sm, color: C.text, marginBottom: SPACE.sm };
const rowValue = { color: C.textSoft, fontWeight: 400 };

function syncText(t, lang, status, lastSyncedAt) {
  if (status === 'syncing') return t('settings.sync.syncing');
  if (status === 'error') return t('settings.sync.error');
  if (lastSyncedAt) {
    const time = lastSyncedAt.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'de-DE', { hour: '2-digit', minute: '2-digit' });
    return t('settings.sync.syncedAt', { time });
  }
  return t('settings.sync.synced');
}

// Wiederverwendbare Pill-Auswahl (Theme + Sprache teilen die Optik).
function PillGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            style={{
              fontFamily: 'inherit', fontSize: FONT.sm, fontWeight: 500, minHeight: 40,
              background: active ? C.primarySoft : 'transparent',
              border: `1px solid ${active ? C.primary : C.border}`, borderRadius: 999,
              padding: '5px 16px', color: active ? C.primary : C.textSoft, cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// User-tunable FSRS knobs. Persisted via setSetting in db.js; retention also
// needs to reach the scheduler itself (see App.jsx's onRetentionChange).
export default function Settings({
  retention, newPerSession, theme, lang,
  onRetentionChange, onNewPerSessionChange, onThemeChange, onLangChange,
  syncStatus, lastSyncedAt, userEmail, onLogout,
}) {
  const { t } = useT();
  const retentionPct = Math.round(retention * 100);

  const themeOptions = [
    { value: 'system', label: t('settings.theme.system') },
    { value: 'light', label: t('settings.theme.light') },
    { value: 'dark', label: t('settings.theme.dark') },
  ];
  const langOptions = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
  ];

  return (
    // Leads inside the settings card (App.jsx renders the heading), so no
    // top divider of its own.
    <div style={{ paddingTop: '0.5rem' }}>
      <span style={label}>{t('settings.language')}</span>
      <PillGroup options={langOptions} value={lang} onChange={onLangChange} />

      <span style={label}>{t('settings.appearance')}</span>
      <PillGroup options={themeOptions} value={theme} onChange={onThemeChange} />

      <label style={label}>
        {t('settings.retention')} <span style={rowValue}>· {retentionPct}%</span>
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
        {t('settings.newPerSession')} <span style={rowValue}>{t('settings.newPerSessionHint')}</span>
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
          style={{ ...inputStyle, display: 'block', marginTop: 6, width: 80, fontSize: FONT.base, padding: '6px 10px' }}
        />
      </label>

      {onLogout && (
        <div style={{ marginTop: '1.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '1rem' }}>
          <span style={label}>{t('settings.account')}</span>
          {userEmail && (
            <div style={{ fontSize: FONT.sm, color: C.text, marginBottom: SPACE.xs }}>{userEmail}</div>
          )}
          <div style={{ fontSize: FONT.xs, color: syncStatus === 'error' ? C.danger : C.textSoft, marginBottom: SPACE.md }}>
            {syncText(t, lang, syncStatus, lastSyncedAt)}
          </div>
          <button type="button" onClick={onLogout} style={{ ...linkBtn, color: C.danger }}>
            {t('settings.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
