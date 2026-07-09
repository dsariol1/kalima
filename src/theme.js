// Shared visual tokens. A fresh, modern learning-app palette — off-white
// surfaces, a saturated green-teal primary, and warm gold accents that keep
// the Arabic identity alongside the Amiri script.
export const C = {
  text: '#1B2A26',
  textSoft: '#54655F',
  bg: '#F6F8F7',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F0',
  primary: '#0F766E',
  primarySoft: '#E6F4F1',
  gold: '#A16207',
  goldSoft: '#F5EBD8',
  danger: '#B42318',
  dangerSoft: '#FDEEEA',
  success: '#0F766E', // alias of primary — one green for "correct" everywhere
  border: '#E3E8E5',
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
