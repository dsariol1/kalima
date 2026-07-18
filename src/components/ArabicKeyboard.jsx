import { Delete } from 'lucide-react';
import { useT } from '../i18n/i18n.jsx';
import { C, FONT } from '../theme.js';

// The Arabic alphabet in traditional order, plus the common hamza/alef
// variants and ة/ى — everything needed to type a word. Harakat are omitted
// on purpose: answerCheck.js strips them before comparing, so they're not
// needed to get a production answer right, only more buttons to scan.
const LETTERS = [
  'ا', 'أ', 'إ', 'آ', 'ء', 'ب', 'ت', 'ة', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ى',
];

// Click-to-type Arabic letters — exists because a Latin physical keyboard's
// OS-level Arabic layout doesn't map anywhere near mnemonically (unlike a
// phone's tap-to-select virtual keyboard), so production cards would
// otherwise be nearly untypable on a laptop.
export default function ArabicKeyboard({ onKey, onBackspace }) {
  const { t } = useT();
  const keyStyle = {
    fontFamily: 'Amiri, serif', fontSize: FONT.arSm, padding: '8px 0', minHeight: 40,
    border: `1px solid ${C.border}`, borderRadius: 8, touchAction: 'manipulation',
    backgroundColor: C.surface, color: C.text, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginBottom: 12 }}>
      {LETTERS.map((ch) => (
        <button key={ch} type="button" onClick={() => onKey(ch)} style={keyStyle}>
          {ch}
        </button>
      ))}
      <button
        type="button"
        onClick={onBackspace}
        aria-label={t('keyboard.delete')}
        style={{
          ...keyStyle, gridColumn: 'span 2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: C.surfaceMuted,
        }}
      >
        <Delete size={16} />
      </button>
    </div>
  );
}
