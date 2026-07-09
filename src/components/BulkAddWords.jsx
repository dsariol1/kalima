import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { parseVocabLines, slugUnit } from '../utils/parseVocabList.js';
import { C, card, backBtn, primaryBtn, inputStyle, fieldLabel } from '../theme.js';

const NEW_CHAPTER = '__new__';

// Paste-a-whole-chapter alternative to AddWord: one line per word instead of
// one form submission per word, for typing up a chapter from the learner's
// own book in one go. Same fields, same "learner's own material" model —
// this only ever writes to customVocab, never to the built-in vocab files.
export default function BulkAddWords({ bookId, units, onSave, onCancel }) {
  const [unit, setUnit] = useState(units[0]?.id || NEW_CHAPTER);
  const [newChapterName, setNewChapterName] = useState('');
  const [text, setText] = useState('');

  const targetUnit = useMemo(() => {
    if (unit !== NEW_CHAPTER) {
      const u = units.find((x) => x.id === unit);
      return { id: unit, titleDe: u?.titleDe || unit };
    }
    const titleDe = newChapterName.trim();
    if (!titleDe) return null;
    return { id: slugUnit(titleDe, units.map((u) => u.id)), titleDe };
  }, [unit, newChapterName, units]);

  const parsed = useMemo(() => {
    if (!targetUnit) return { entries: [], errors: [] };
    return parseVocabLines(text, { bookId, unit: targetUnit.id, unitDe: targetUnit.titleDe });
  }, [text, targetUnit, bookId]);

  const canSave = targetUnit && parsed.entries.length > 0;

  const label = fieldLabel;

  return (
    <div>
      <button onClick={onCancel} style={{ ...backBtn, marginBottom: 14 }}>
        <ArrowLeft size={15} /> Zurück
      </button>

      <div style={{ ...card, padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, marginBottom: 4 }}>Vokabelliste einfügen</div>
        <div style={{ fontSize: 12.5, color: C.textSoft, marginBottom: 14 }}>
          Ein Wort pro Zeile: <code>Arabisch / Deutsch / Umschrift? / Wurzel? / Wurzelbedeutung?</code> —
          nur Arabisch und Deutsch sind Pflicht. Die Felder selbst dürfen kein „/" enthalten.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={label}>Kapitel</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.titleDe}</option>)}
              <option value={NEW_CHAPTER}>+ Neues Kapitel</option>
            </select>
          </div>

          {unit === NEW_CHAPTER && (
            <div>
              <span style={label}>Name des neuen Kapitels</span>
              <input
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                placeholder="z. B. Essen & Trinken"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <span style={label}>Wortliste</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'بَيْت / Haus\nكِتَاب / Buch / kitāb\nمَدْرَسَة / Schule / madrasa / م د ر س / Lernen'}
              rows={10}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {text.trim() && (
            <div style={{ fontSize: 12.5, color: C.textSoft }}>
              {parsed.entries.length} Wort{parsed.entries.length === 1 ? '' : 'e'} erkannt
              {parsed.errors.length > 0 && (
                <span style={{ color: C.danger }}>
                  {' '}· {parsed.errors.length} Zeile{parsed.errors.length === 1 ? '' : 'n'} übersprungen (Zeile{' '}
                  {parsed.errors.map((e) => e.line).join(', ')})
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => canSave && onSave(parsed.entries)}
          disabled={!canSave}
          style={{
            ...primaryBtn, marginTop: 16, width: '100%', padding: '10px', fontSize: 14,
            background: canSave ? C.primary : C.surfaceMuted,
            color: canSave ? '#FFFFFF' : C.textSoft,
            cursor: canSave ? 'pointer' : 'default',
          }}
        >
          {parsed.entries.length > 0 ? `${parsed.entries.length} Wörter hinzufügen` : 'Wörter hinzufügen'}
        </button>
      </div>
    </div>
  );
}
