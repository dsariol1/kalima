import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { parseVocabLines, slugUnit } from '../utils/parseVocabList.js';
import { useT, useLang } from '../i18n/i18n.jsx';
import { C, card, backBtn, primaryBtn, inputStyle, fieldLabel, FONT } from '../theme.js';

const NEW_CHAPTER = '__new__';

// Paste-a-whole-chapter alternative to AddWord: one line per word instead of
// one form submission per word, for typing up a chapter from the learner's
// own book in one go. Same fields, same "learner's own material" model —
// this only ever writes to customVocab, never to the built-in vocab files.
export default function BulkAddWords({ bookId, units, exitLabel, onSave, onCancel }) {
  const { t, tn } = useT();
  const lang = useLang();
  const unitTitle = (u) => (lang === 'en' ? (u.titleEn ?? u.titleDe) : u.titleDe);
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
        <ArrowLeft size={15} /> {exitLabel || t('common.back')}
      </button>

      <div style={{ ...card, padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: 4 }}>{t('bulkAdd.title')}</div>
        <div style={{ fontSize: FONT.sm, color: C.textSoft, marginBottom: 14 }}>
          {t('bulkAdd.formatHelp')} <code>{t('bulkAdd.formatCode')}</code> {t('bulkAdd.formatNote')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={label}>{t('bulkAdd.chapter')}</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
              {units.map((u) => <option key={u.id} value={u.id}>{unitTitle(u)}</option>)}
              <option value={NEW_CHAPTER}>{t('bulkAdd.newChapter')}</option>
            </select>
          </div>

          {unit === NEW_CHAPTER && (
            <div>
              <span style={label}>{t('bulkAdd.newChapterName')}</span>
              <input
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                placeholder={t('bulkAdd.newChapterPlaceholder')}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <span style={label}>{t('bulkAdd.wordList')}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'بَيْت / Haus\nكِتَاب / Buch / kitāb\nمَدْرَسَة / Schule / madrasa / م د ر س / Lernen'}
              rows={10}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {text.trim() && (
            <div style={{ fontSize: FONT.sm, color: C.textSoft }}>
              {tn('bulkAdd.recognized', parsed.entries.length)}
              {parsed.errors.length > 0 && (
                <span style={{ color: C.danger }}>
                  {tn('bulkAdd.skipped', parsed.errors.length, { lines: parsed.errors.map((e) => e.line).join(', ') })}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => canSave && onSave(parsed.entries)}
          disabled={!canSave}
          style={{
            ...primaryBtn, marginTop: 16, width: '100%', padding: '10px', fontSize: FONT.base,
            background: canSave ? C.primary : C.surfaceMuted,
            color: canSave ? '#FFFFFF' : C.textSoft,
            cursor: canSave ? 'pointer' : 'default',
          }}
        >
          {parsed.entries.length > 0 ? t('bulkAdd.addWords', { count: parsed.entries.length }) : t('bulkAdd.addWordsEmpty')}
        </button>
      </div>
    </div>
  );
}
