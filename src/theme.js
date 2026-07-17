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
  card: 'var(--shadow-card)',
};

// Typo-Skala. Genau diese Stufen verwenden — keine freien Zwischenwerte
// mehr in Komponenten. Arabisch (Amiri) hat eigene Stufen, weil die Schrift
// bei gleicher px-Größe optisch deutlich kleiner rendert als Inter.
export const FONT = {
  xs: 12,   // Metadaten, Pills, Zähler
  sm: 13,   // Sekundärtext, Link-Buttons, Beschreibungen
  base: 14, // Standard-Fließtext, Inputs, Buttons
  md: 16,   // hervorgehobener Text, Tool-Titel
  lg: 18,   // Karten-Überschriften klein
  xl: 21,   // Karten-Überschriften, Antworttext
  h2: 26,   // Screen-Titel, Wortmarke
  h1: 34,   // große Display-Momente
  // Amiri-Stufen
  arXs: 16, // Inline-Chips
  arSm: 18, // Tastatur, Beispielsätze
  arMd: 22, // Buchtitel, Wurzel, Eingabefeld
  arLg: 34, // Quiz-Zielwort
  arXl: 46, // Flashcard-Wort
};

// Spacing-Skala (px). Für margin/padding/gap in Komponenten.
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Shared style primitives — spread into inline style objects and override
// per call site. Keeps button/input/card styling in one place.
export const card = {
  backgroundColor: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: SHADOW.card,
};

export const primaryBtn = {
  fontFamily: 'inherit', fontSize: FONT.base, fontWeight: 500,
  background: C.primary, color: '#FFFFFF', border: 'none',
  borderRadius: 10, padding: '9px 22px', cursor: 'pointer',
};

export const linkBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: FONT.sm, fontWeight: 500, padding: 0,
};

export const backBtn = {
  ...linkBtn, color: C.textSoft, fontSize: FONT.sm, fontWeight: 400,
};

export const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 11px',
  border: `1px solid ${C.border}`, borderRadius: 10, backgroundColor: C.bg,
  fontFamily: 'inherit', fontSize: FONT.base, color: C.text, marginTop: SPACE.xs,
};

export const fieldLabel = { fontSize: FONT.sm, color: C.textSoft, fontWeight: 500 };

export const pill = (color) => ({
  fontSize: FONT.xs, fontWeight: 500, color, border: `1px solid ${color}`,
  borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap',
});
