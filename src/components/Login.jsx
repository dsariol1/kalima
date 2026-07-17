import { useState } from 'react';
import { login, register, requestPasswordReset } from '../auth/pocketbase.js';
import { C, card, primaryBtn, inputStyle, fieldLabel, linkBtn, FONT, SPACE } from '../theme.js';

// Pflicht-Gate vor der App. Drei Modi in einer Karte: Anmelden, Registrieren,
// Passwort zurücksetzen. Nach erfolgreichem Login/Register aktualisiert der
// authStore.onChange in App.jsx den Zustand — hier ist kein onSuccess nötig.

const TITLES = {
  login: 'Anmelden',
  register: 'Konto erstellen',
  reset: 'Passwort zurücksetzen',
};

// PocketBase liefert strukturierte Feldfehler; die häufigsten hier auf Deutsch,
// sonst die Rohmeldung als Fallback.
function errorText(e, mode) {
  // status 0 = kein HTTP-Response (Server nicht erreichbar / offline).
  if (!e?.status) return 'Keine Verbindung zum Server. Bitte später erneut versuchen.';
  if (e.status === 400 && mode === 'login') return 'E-Mail oder Passwort ist falsch.';
  const data = e?.response?.data;
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0];
    if (first?.message) return first.message;
  }
  return e?.message || 'Etwas ist schiefgelaufen.';
}

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      } else {
        await requestPasswordReset(email);
        setNotice('Falls ein Konto zu dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.');
      }
      // Bei Login/Register übernimmt authStore.onChange das Weiterrendern.
    } catch (err) {
      // Sonderfall: Registrierung ok, aber E-Mail-Bestätigung ist Pflicht →
      // authWithPassword schlägt fehl. Als Hinweis statt Fehler zeigen.
      if (mode === 'register' && err?.status === 401) {
        setNotice('Konto erstellt. Bitte bestätige zuerst deine E-Mail-Adresse.');
      } else {
        setError(errorText(err, mode));
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
            {TITLES[mode]}
          </h1>

          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={fieldLabel}>E-Mail</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>

          {mode !== 'reset' && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={fieldLabel}>Passwort</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              {mode === 'register' && (
                <span style={{ ...fieldLabel, fontSize: FONT.xs, display: 'block', marginTop: SPACE.xs }}>
                  Mindestens 8 Zeichen.
                </span>
              )}
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
            {busy ? 'Bitte warten …' : TITLES[mode]}
          </button>

          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 8,
            marginTop: 16, flexWrap: 'wrap',
          }}>
            {mode === 'login' && (
              <>
                <button type="button" style={linkBtn} onClick={() => switchMode('register')}>
                  Neues Konto erstellen
                </button>
                <button type="button" style={{ ...linkBtn, color: C.textSoft }} onClick={() => switchMode('reset')}>
                  Passwort vergessen?
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" style={linkBtn} onClick={() => switchMode('login')}>
                ← Zurück zur Anmeldung
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
