import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { useT } from '../i18n/i18n.jsx';
import { C, FONT } from '../theme.js';


// Deck backup: export the whole local state to a JSON file, or import one back
// in. The actual DB access lives in db.js; this only wires up the download and
// file-read and reports the outcome. Import merges, so it never wipes progress.
export default function BackupControls({ onExport, onImport }) {
  const { t } = useT();
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null); // { kind: 'ok' | 'err', msg }

  const doExport = async () => {
    try {
      await onExport();
      setStatus({ kind: 'ok', msg: t('backup.exported') });
    } catch {
      setStatus({ kind: 'err', msg: t('backup.exportFailed') });
    }
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again later
    if (!file) return;
    try {
      const c = await onImport(file);
      setStatus({ kind: 'ok', msg: t('backup.imported', { vocab: c.customVocab, progress: c.progress }) });
    } catch {
      setStatus({ kind: 'err', msg: t('backup.importFailed') });
    }
  };

  const btn = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: FONT.sm, color: C.text,
  };

  return (
    <div style={{
      marginTop: '1.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '1rem',
    }}>
      <div style={{ fontSize: FONT.xs, color: C.textSoft, marginBottom: 8 }}>
        {t('backup.note')}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={doExport} style={btn}>
          <Download size={14} /> {t('backup.export')}
        </button>
        <button onClick={() => fileRef.current?.click()} style={btn}>
          <Upload size={14} /> {t('backup.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={doImport}
          style={{ display: 'none' }}
        />
      </div>
      {status && (
        <div style={{
          marginTop: 8, fontSize: FONT.sm,
          color: status.kind === 'ok' ? C.success : C.danger,
        }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
