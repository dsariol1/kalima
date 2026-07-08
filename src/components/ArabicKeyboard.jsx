import { Delete } from 'lucide-react';
import { C } from '../theme.js';

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
  const keyStyle = {
    fontFamily: 'Amiri, serif', fontSize: 18, padding: '8px 0',
    border: `1px solid ${C.hairline}`, borderRadius: 6,
    backgroundColor: C.parchmentLight, color: C.ink, cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 12 }}>
      {LETTERS.map((ch) => (
        <button key={ch} type="button" onClick={() => onKey(ch)} style={keyStyle}>
          {ch}
        </button>
      ))}
      <button
        type="button"
        onClick={onBackspace}
        aria-label="Löschen"
        style={{
          ...keyStyle, gridColumn: 'span 2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: C.parchmentDeep,
        }}
      >
        <Delete size={16} />
      </button>
    </div>
  );
}
