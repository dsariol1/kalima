import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { C } from '../theme.js';

// Form for adding a word from whatever lesson the learner is studying.
// This is how the deck grows into their own material — the vocab and its
// meaning are the learner's own notes, stored locally in their browser.
export default function AddWord({ bookId, units, onSave, onCancel }) {
  const [ar, setAr] = useState('');
  const [de, setDe] = useState('');
  const [translit, setTranslit] = useState('');
  const [unit, setUnit] = useState(units[0]?.id || 'custom');
  const [rootStr, setRootStr] = useState('');
  const [rootMeaning, setRootMeaning] = useState('');

  const stripHarakat = (s) => s.replace(/[\u064B-\u0652\u0670]/g, '');

  const canSave = ar.trim() && de.trim();

  const save = () => {
    if (!canSave) return;
    const rootArr = rootStr.trim()
      ? rootStr.trim().split(/[\s-]+/).filter(Boolean)
      : null;
    const entry = {
      id: `custom-${Date.now()}`,
      bookId,
      unit,
      unitDe: units.find((u) => u.id === unit)?.titleDe || 'Eigene Wörter',
      pos: 'custom',
      ar: ar.trim(),
      bare: stripHarakat(ar.trim()),
      translit: translit.trim(),
      de: de.trim(),
      root: rootArr,
      rootMeaning: rootMeaning.trim() || null,
      custom: true,
    };
    onSave(entry);
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '9px 11px',
    border: `1px solid ${C.hairline}`, borderRadius: 8, backgroundColor: C.parchmentLight,
    fontFamily: 'inherit', fontSize: 14, color: C.ink, marginTop: 4,
  };
  const label = { fontSize: 12.5, color: C.inkSoft, fontWeight: 500 };

  return (
    <div>
      <button
        onClick={onCancel}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: C.inkSoft, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Zurück
      </button>

      <div style={{ border: `1px solid ${C.hairline}`, borderRadius: 14, backgroundColor: C.parchment, padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 14 }}>Eigenes Wort hinzufügen</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={label}>Arabisch (mit Harakat)</span>
            <input dir="rtl" value={ar} onChange={(e) => setAr(e.target.value)}
              placeholder="مَثَلًا: دَرْس" style={{ ...inputStyle, fontFamily: 'Amiri, serif', fontSize: 20 }} />
          </div>
          <div>
            <span style={label}>Bedeutung (Deutsch)</span>
            <input value={de} onChange={(e) => setDe(e.target.value)} placeholder="z. B. Unterricht, Lektion" style={inputStyle} />
          </div>
          <div>
            <span style={label}>Umschrift (optional)</span>
            <input value={translit} onChange={(e) => setTranslit(e.target.value)} placeholder="dars" style={inputStyle} />
          </div>
          <div>
            <span style={label}>Lektion</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.titleDe}</option>)}
              <option value="custom">Eigene Wörter</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={label}>Wurzel (optional)</span>
              <input dir="rtl" value={rootStr} onChange={(e) => setRootStr(e.target.value)}
                placeholder="د ر س" style={{ ...inputStyle, fontFamily: 'Amiri, serif' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>Wurzelbedeutung</span>
              <input value={rootMeaning} onChange={(e) => setRootMeaning(e.target.value)} placeholder="lernen" style={inputStyle} />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          style={{
            marginTop: 16, width: '100%', background: canSave ? C.teal : C.parchmentDeep,
            color: canSave ? '#F8F2E3' : C.inkSoft, border: 'none', borderRadius: 8,
            padding: '10px', cursor: canSave ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
          }}
        >
          Hinzufügen
        </button>
      </div>
    </div>
  );
}
