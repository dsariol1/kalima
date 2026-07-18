import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useT, useLang } from '../i18n/i18n.jsx';
import { C, card, backBtn, primaryBtn, inputStyle, fieldLabel, FONT } from '../theme.js';

// Form for adding a word from whatever lesson the learner is studying.
// This is how the deck grows into their own material — the vocab and its
// meaning are the learner's own notes, stored locally in their browser.
export default function AddWord({ bookId, units, exitLabel, onSave, onCancel }) {
  const { t } = useT();
  const lang = useLang();
  const unitTitle = (u) => (lang === 'en' ? (u.titleEn ?? u.titleDe) : u.titleDe);
  const [ar, setAr] = useState('');
  const [de, setDe] = useState('');
  const [enMeaning, setEnMeaning] = useState('');
  const [translit, setTranslit] = useState('');
  const [unit, setUnit] = useState(units[0]?.id || 'custom');
  const [rootStr, setRootStr] = useState('');
  const [rootMeaning, setRootMeaning] = useState('');

  const stripHarakat = (s) => s.replace(/[ً-ْٰ]/g, '');

  const canSave = ar.trim() && de.trim();

  const save = () => {
    if (!canSave) return;
    const rootArr = rootStr.trim()
      ? rootStr.trim().split(/[\s-]+/).filter(Boolean)
      : null;
    const selected = units.find((u) => u.id === unit);
    const entry = {
      id: `custom-${Date.now()}`,
      bookId,
      unit,
      // Deutscher Anzeigename Pflicht; englischer Zwilling für die EN-Anzeige.
      // Fallback-Titel zweisprachig als Konstanten, damit beide Sprachen greifen.
      unitDe: selected?.titleDe || 'Eigene Wörter',
      unitEn: selected?.titleEn || 'Own words',
      pos: 'custom',
      ar: ar.trim(),
      bare: stripHarakat(ar.trim()),
      translit: translit.trim(),
      de: de.trim(),
      // Optional: leer -> null, damit die Anzeige auf Deutsch zurückfällt.
      en: enMeaning.trim() || null,
      root: rootArr,
      rootMeaning: rootMeaning.trim() || null,
      custom: true,
    };
    onSave(entry);
  };

  const label = fieldLabel;

  return (
    <div>
      <button onClick={onCancel} style={{ ...backBtn, marginBottom: 14 }}>
        <ArrowLeft size={15} /> {exitLabel || t('common.back')}
      </button>

      <div style={{ ...card, padding: '1.25rem' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: 14 }}>{t('addWord.title')}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <span style={label}>{t('addWord.arLabel')}</span>
            <input dir="rtl" lang="ar" value={ar} onChange={(e) => setAr(e.target.value)}
              placeholder={t('addWord.arPlaceholder')} style={{ ...inputStyle, fontFamily: 'Amiri, serif', fontSize: FONT.arMd }} />
          </div>
          <div>
            <span style={label}>{t('addWord.deLabel')}</span>
            <input value={de} onChange={(e) => setDe(e.target.value)} placeholder={t('addWord.dePlaceholder')} style={inputStyle} />
          </div>
          <div>
            <span style={label}>{t('addWord.enLabel')}</span>
            <input value={enMeaning} onChange={(e) => setEnMeaning(e.target.value)} placeholder={t('addWord.enPlaceholder')} style={inputStyle} />
          </div>
          <div>
            <span style={label}>{t('addWord.translitLabel')}</span>
            <input value={translit} onChange={(e) => setTranslit(e.target.value)} placeholder={t('addWord.translitPlaceholder')} style={inputStyle} />
          </div>
          <div>
            <span style={label}>{t('addWord.lessonLabel')}</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
              {units.map((u) => <option key={u.id} value={u.id}>{unitTitle(u)}</option>)}
              <option value="custom">{t('addWord.ownWords')}</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <span style={label}>{t('addWord.rootLabel')}</span>
              <input dir="rtl" lang="ar" value={rootStr} onChange={(e) => setRootStr(e.target.value)}
                placeholder={t('addWord.rootPlaceholder')} style={{ ...inputStyle, fontFamily: 'Amiri, serif' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>{t('addWord.rootMeaningLabel')}</span>
              <input value={rootMeaning} onChange={(e) => setRootMeaning(e.target.value)} placeholder={t('addWord.rootMeaningPlaceholder')} style={inputStyle} />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          disabled={!canSave}
          style={{
            ...primaryBtn, marginTop: 16, width: '100%', padding: '10px', fontSize: FONT.base,
            background: canSave ? C.primary : C.surfaceMuted,
            color: canSave ? '#FFFFFF' : C.textSoft,
            cursor: canSave ? 'pointer' : 'default',
          }}
        >
          {t('addWord.add')}
        </button>
      </div>
    </div>
  );
}
