import { Volume2 } from 'lucide-react';
import { speak } from '../utils/speak.js';
import { C } from '../theme.js';

const BADGE = {
  recognition: { label: 'Erkennen', color: C.teal },
  production: { label: 'Produzieren', color: C.gold },
};

function ArabicWord({ card, harakat }) {
  return (
    <>
      <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 46, lineHeight: 1.3, marginBottom: 6 }}>
        {harakat ? card.ar : card.bare}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, color: C.inkSoft, fontStyle: 'italic' }}>{card.translit}</span>
        <button
          onClick={() => speak(card.ar)}
          aria-label="Aussprache abspielen"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gold, padding: 4, display: 'flex' }}
        >
          <Volume2 size={16} />
        </button>
      </div>
    </>
  );
}

function RootFamily({ card, family }) {
  if (!card.root) return null;
  return (
    <div style={{ borderTop: `1px solid ${C.hairline}`, paddingTop: 12 }}>
      <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 22, letterSpacing: 3, marginBottom: 2 }}>
        {card.root.join(' ')}
      </div>
      <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: family.length ? 10 : 0 }}>
        Wurzel · {card.rootMeaning}
      </div>
      {family.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {family.map((f) => (
            <span
              key={f.id}
              style={{
                border: `1px solid ${C.hairline}`, borderRadius: 20, padding: '4px 12px',
                backgroundColor: C.parchmentLight, fontSize: 12.5,
                display: 'inline-flex', gap: 6, alignItems: 'center',
              }}
            >
              <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 15 }}>{f.ar}</span>
              <span style={{ color: C.inkSoft }}>— {f.de}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Example({ card }) {
  if (!card.example) return null;
  return (
    <div style={{ borderTop: `1px solid ${C.hairline}`, marginTop: 14, paddingTop: 12 }}>
      <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 19, marginBottom: 4 }}>{card.example.ar}</div>
      <div style={{ fontSize: 13, color: C.inkSoft, fontStyle: 'italic' }}>„{card.example.de}"</div>
    </div>
  );
}

// One vocabulary card, direction-aware:
// - recognition: front = Arabic + transliteration + audio, back = meaning + root + example.
// - production: front = German meaning, back = Arabic + transliteration + audio + root + example.
export default function Flashcard({ card, direction, harakat, revealed, onReveal, family }) {
  const badge = BADGE[direction];
  const isProduction = direction === 'production';

  return (
    <div
      style={{
        border: `1px solid ${C.hairline}`,
        borderRadius: 14,
        backgroundColor: C.parchment,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.25rem',
      }}
    >
      {badge && (
        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 500, color: badge.color,
          border: `1px solid ${badge.color}`, borderRadius: 20, padding: '2px 10px', marginBottom: 14,
        }}>
          {badge.label}
        </div>
      )}

      {isProduction ? (
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24 }}>{card.de}</div>
      ) : (
        <ArabicWord card={card} harakat={harakat} />
      )}

      {!revealed ? (
        <button
          onClick={onReveal}
          style={{
            marginTop: 16, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500,
            background: C.teal, color: '#F8F2E3', border: 'none',
            borderRadius: 8, padding: '9px 22px', cursor: 'pointer',
          }}
        >
          {isProduction ? 'Wort zeigen' : 'Bedeutung zeigen'}
        </button>
      ) : isProduction ? (
        <div style={{ marginTop: 16 }}>
          <ArabicWord card={card} harakat={harakat} />
          <div style={{ marginTop: 14 }}>
            <RootFamily card={card} family={family} />
            <Example card={card} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 21, marginBottom: 14 }}>{card.de}</div>
          <RootFamily card={card} family={family} />
          <Example card={card} />
        </div>
      )}
    </div>
  );
}
