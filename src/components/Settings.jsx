import { useState } from 'react';
import { C, inputStyle, primaryBtn, linkBtn, FONT, SPACE } from '../theme.js';
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

// Eigenständiges Formular mit lokalem State (analog Login.jsx), damit Settings
// selbst keine Auth-Logik kennen muss — onChangePassword kommt aus App.jsx und
// ruft direkt auth/pocketbase.js auf.
function ChangePasswordForm({ onChangePassword }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const reset = () => {
    setOldPassword('');
    setPassword('');
    setPasswordConfirm('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await onChangePassword(oldPassword, password, passwordConfirm);
      setNotice(t('settings.changePassword.done'));
      reset();
      setOpen(false);
    } catch (err) {
      const data = err?.response?.data;
      const first = data && typeof data === 'object' ? Object.values(data)[0] : null;
      setError(first?.message || err?.message || t('login.errors.generic'));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <>
        {notice && <div style={{ fontSize: FONT.sm, color: C.primary, marginBottom: SPACE.xs }}>{notice}</div>}
        <button type="button" style={linkBtn} onClick={() => { setOpen(true); setNotice(null); }}>
          {t('settings.changePassword.trigger')}
        </button>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: SPACE.sm }}>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <span style={label}>{t('settings.changePassword.old')}</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <span style={label}>{t('settings.changePassword.new')}</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={{ display: 'block', marginBottom: 10 }}>
        <span style={label}>{t('settings.changePassword.confirm')}</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          style={inputStyle}
        />
      </label>

      {error && <div style={{ fontSize: FONT.sm, color: C.danger, marginBottom: SPACE.sm }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="submit" disabled={busy} style={{
          ...primaryBtn, padding: '8px 16px', fontSize: FONT.sm,
          opacity: busy ? 0.6 : 1, cursor: busy ? 'default' : 'pointer',
        }}>
          {busy ? t('login.pleaseWait') : t('settings.changePassword.submit')}
        </button>
        <button type="button" style={{ ...linkBtn, color: C.textSoft }} onClick={() => { setOpen(false); setError(null); reset(); }}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}

// User-tunable FSRS knobs. Persisted via setSetting in db.js; retention also
// needs to reach the scheduler itself (see App.jsx's onRetentionChange).
export default function Settings({
  retention, newPerSession, theme, lang,
  onRetentionChange, onNewPerSessionChange, onThemeChange, onLangChange,
  syncStatus, lastSyncedAt, userEmail, onLogout, onChangePassword,
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
          {onChangePassword && (
            <div style={{ marginBottom: SPACE.md }}>
              <ChangePasswordForm onChangePassword={onChangePassword} />
            </div>
          )}
          <button type="button" onClick={onLogout} style={{ ...linkBtn, color: C.danger }}>
            {t('settings.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
