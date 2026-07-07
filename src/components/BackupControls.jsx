import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { C } from '../theme.js';

// Deck backup: export the whole local state to a JSON file, or import one back
// in. The actual DB access lives in db.js; this only wires up the download and
// file-read and reports the outcome. Import merges, so it never wipes progress.
export default function BackupControls({ onExport, onImport }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null); // { kind: 'ok' | 'err', msg }

  const doExport = async () => {
    try {
      await onExport();
      setStatus({ kind: 'ok', msg: 'Sicherung heruntergeladen.' });
    } catch {
      setStatus({ kind: 'err', msg: 'Export fehlgeschlagen.' });
    }
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again later
    if (!file) return;
    try {
      const c = await onImport(file);
      setStatus({ kind: 'ok', msg: `Importiert: ${c.customVocab} eigene Wörter, ${c.progress} Kartenstände.` });
    } catch {
      setStatus({ kind: 'err', msg: 'Import fehlgeschlagen — ist das eine gültige Sicherungsdatei?' });
    }
  };

  const btn = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: C.parchmentLight, border: `1px solid ${C.hairline}`, borderRadius: 8,
    padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, color: C.ink,
  };

  return (
    <div style={{
      marginTop: '1.5rem', borderTop: `1px solid ${C.hairline}`, paddingTop: '1rem',
    }}>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 8 }}>
        Sicherung — dein Fortschritt liegt nur lokal im Browser.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={doExport} style={btn}>
          <Download size={14} /> Exportieren
        </button>
        <button onClick={() => fileRef.current?.click()} style={btn}>
          <Upload size={14} /> Importieren
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
          marginTop: 8, fontSize: 12.5,
          color: status.kind === 'ok' ? '#3E6259' : '#9C4A3C',
        }}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
