// Shared visual tokens. A fresh, modern learning-app palette — off-white
// surfaces, a saturated green-teal primary, and warm gold accents that keep
// the Arabic identity alongside the Amiri script.
//
// Values are CSS custom-property references, not hex literals — the actual
// colors live in index.css (:root, prefers-color-scheme, [data-theme]).
// That means dark mode needs no React re-render: the browser resolves var()
// at paint time, so every inline style built from C (here and in the
// card/button/input primitives below) repaints itself the moment
// documentElement's data-theme attribute changes (see App.jsx).
export const C = {
  text: 'var(--text)',
  textSoft: 'var(--textSoft)',
  bg: 'var(--bg)',
  surface: 'var(--surface)',
  surfaceMuted: 'var(--surfaceMuted)',
  primary: 'var(--primary)',
  primarySoft: 'var(--primarySoft)',
  gold: 'var(--gold)',
  goldSoft: 'var(--goldSoft)',
  danger: 'var(--danger)',
  dangerSoft: 'var(--dangerSoft)',
  success: 'var(--primary)', // alias of primary — one green for "correct" everywhere
  border: 'var(--border)',
};

export const SHADOW = {
  card: '0 1px 2px rgba(27,42,38,0.05), 0 4px 14px rgba(27,42,38,0.06)',
};

// Shared style primitives — spread into inline style objects and override
// per call site. Keeps button/input/card styling in one place.
export const card = {
  backgroundColor: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: SHADOW.card,
};

export const primaryBtn = {
  fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
  background: C.primary, color: '#FFFFFF', border: 'none',
  borderRadius: 10, padding: '9px 22px', cursor: 'pointer',
};

export const linkBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, padding: 0,
};

export const backBtn = {
  ...linkBtn, color: C.textSoft, fontSize: 13, fontWeight: 400,
};

export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 11px',
  border: `1px solid ${C.border}`, borderRadius: 10, backgroundColor: C.bg,
  fontFamily: 'inherit', fontSize: 14, color: C.text, marginTop: 4,
};

export const fieldLabel = { fontSize: 12.5, color: C.textSoft, fontWeight: 500 };

export const pill = (color) => ({
  fontSize: 11, fontWeight: 500, color, border: `1px solid ${color}`,
  borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap',
});
