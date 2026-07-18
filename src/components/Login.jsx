import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { login, register, requestPasswordReset, confirmPasswordReset } from '../auth/pocketbase.js';
import { useT } from '../i18n/i18n.jsx';
import { C, card, primaryBtn, inputStyle, fieldLabel, linkBtn, FONT, SPACE } from '../theme.js';

// Pflicht-Gate vor der App. Drei Modi in einer Karte: Anmelden, Registrieren,
// Passwort zurücksetzen. Nach erfolgreichem Login/Register aktualisiert der
// authStore.onChange in App.jsx den Zustand — hier ist kein onSuccess nötig.

// PocketBase liefert strukturierte Feldfehler; die häufigsten übersetzt,
// sonst die Rohmeldung als Fallback. `t` kommt aus useT().
function errorText(t, e, mode) {
  // status 0 = kein HTTP-Response (Server nicht erreichbar / offline).
  if (!e?.status) return t('login.errors.noConnection');
  if (e.status === 400 && mode === 'login') return t('login.errors.badCredentials');
  const data = e?.response?.data;
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0];
    if (first?.message) return first.message;
  }
  return e?.message || t('login.errors.generic');
}

// PocketBase-Mail-Link landet mit ?token=... auf der App-Root. Token einmalig
// aus der URL lesen und sofort entfernen, damit ein Reload nicht erneut in
// den Confirm-Modus springt.
function readResetToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    params.delete('token');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
  }
  return token;
}

export default function Login() {
  const { t } = useT();
  const [resetToken] = useState(readResetToken);
  const [mode, setMode] = useState(resetToken ? 'resetConfirm' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password);
      } else if (mode === 'resetConfirm') {
        await confirmPasswordReset(resetToken, password, passwordConfirm);
        setNotice(t('login.resetDone'));
        setMode('login');
        setPassword('');
        setPasswordConfirm('');
      } else {
        await requestPasswordReset(email);
        setNotice(t('login.resetSent'));
      }
      // Bei Login/Register übernimmt authStore.onChange das Weiterrendern.
    } catch (err) {
      // Sonderfall: Registrierung ok, aber E-Mail-Bestätigung ist Pflicht →
      // authWithPassword schlägt fehl. Als Hinweis statt Fehler zeigen.
      if (mode === 'register' && err?.status === 401) {
        setNotice(t('login.registerConfirm'));
      } else {
        setError(errorText(t, err, mode));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif', backgroundColor: C.bg, minHeight: '100vh',
      color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: FONT.h1, fontWeight: 700,
          textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1,
        }}>
          Kalima<span style={{ color: C.gold }}>+</span>
        </div>

        <form onSubmit={onSubmit} style={{ ...card, padding: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, fontWeight: 600, margin: '0 0 1.25rem' }}>
            {t(`login.titles.${mode}`)}
          </h1>

          {mode !== 'resetConfirm' && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={fieldLabel}>{t('login.email')}</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}

          {mode !== 'reset' && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={fieldLabel}>{t('login.password')}</span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  style={{
                    position: 'absolute', right: 4, top: 0, bottom: 0, width: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', color: C.textSoft, cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(mode === 'register' || mode === 'resetConfirm') && (
                <span style={{ ...fieldLabel, fontSize: FONT.xs, display: 'block', marginTop: SPACE.xs }}>
                  {t('login.minChars')}
                </span>
              )}
            </label>
          )}

          {mode === 'resetConfirm' && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={fieldLabel}>{t('login.passwordConfirm')}</span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                style={inputStyle}
              />
            </label>
          )}

          {error && (
            <div style={{ fontSize: FONT.sm, color: C.danger, marginBottom: SPACE.md }}>{error}</div>
          )}
          {notice && (
            <div style={{ fontSize: FONT.sm, color: C.primary, marginBottom: SPACE.md }}>{notice}</div>
          )}

          <button type="submit" disabled={busy} style={{
            ...primaryBtn, width: '100%', padding: '11px', fontSize: FONT.base,
            opacity: busy ? 0.6 : 1, cursor: busy ? 'default' : 'pointer',
          }}>
            {busy ? t('login.pleaseWait') : t(`login.titles.${mode}`)}
          </button>

          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 8,
            marginTop: 16, flexWrap: 'wrap',
          }}>
            {mode === 'login' && (
              <>
                <button type="button" style={linkBtn} onClick={() => switchMode('register')}>
                  {t('login.createAccount')}
                </button>
                <button type="button" style={{ ...linkBtn, color: C.textSoft }} onClick={() => switchMode('reset')}>
                  {t('login.forgotPassword')}
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" style={linkBtn} onClick={() => switchMode('login')}>
                {t('login.backToLogin')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
