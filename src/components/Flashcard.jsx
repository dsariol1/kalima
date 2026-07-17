import { useRef, useState } from 'react';
import { Keyboard, Share2 } from 'lucide-react';
import { checkAnswer } from '../utils/answerCheck.js';
import ArabicKeyboard from './ArabicKeyboard.jsx';
import { C, card as cardStyle, primaryBtn, linkBtn, inputStyle, pill, FONT, SPACE } from '../theme.js';
import { ROOT_KEYS } from '../data/rootFamilies.js';

// Der Wurzel-Explorer-Prototyp kennt bisher nur die Wurzeln aus
// rootFamilies.js. Der Einstiegslink erscheint deshalb nur für Karten mit
// genau einer davon.
const ROOT_EXPLORER_DEMO_ROOTS = new Set(ROOT_KEYS);

const BADGE = {
  recognition: { label: 'Erkennen', color: C.primary },
  production: { label: 'Produzieren', color: C.gold },
};

const VERDICT = {
  correct: { color: C.success, label: '✓ Richtig' },
  wrong: { color: C.danger, label: '✗ Nicht ganz' },
};

function ArabicWord({ card, harakat }) {
  return (
    <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arXl, lineHeight: 1.5, paddingTop: 6 }}>
      {harakat ? card.ar : card.bare}
    </div>
  );
}

function RootFamily({ card, family, onExploreRoot }) {
  if (!card.root) return null;
  const rootKey = card.root.join('');
  const canExplore = onExploreRoot && ROOT_EXPLORER_DEMO_ROOTS.has(rootKey);
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
      <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arMd, letterSpacing: 3, marginBottom: 2 }}>
        {card.root.join(' ')}
      </div>
      <div style={{ fontSize: FONT.sm, color: C.textSoft, marginBottom: SPACE.sm }}>
        Wurzel · {card.rootMeaning}
      </div>
      {canExplore && (
        <button
          onClick={() => onExploreRoot(rootKey, card.ar)}
          style={{ ...linkBtn, margin: '0 auto 10px', justifyContent: 'center' }}
        >
          <Share2 size={13} /> Wurzelfamilie erkunden
        </button>
      )}
      {family.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {family.map((f) => (
            <span
              key={f.id}
              style={{
                border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 12px',
                backgroundColor: C.bg, fontSize: FONT.sm,
                display: 'inline-flex', gap: 6, alignItems: 'center',
              }}
            >
              <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arXs }}>{f.ar}</span>
              <span style={{ color: C.textSoft }}>— {f.de}</span>
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
    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 12 }}>
      <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arSm, marginBottom: SPACE.xs }}>{card.example.ar}</div>
      <div style={{ fontSize: FONT.sm, color: C.textSoft, fontStyle: 'italic' }}>„{card.example.de}"</div>
    </div>
  );
}

// The German -> Arabic prompt: type the word in Arabic script, check it,
// then self-grade. `onReveal` flips the parent into its grade-buttons state;
// the typed verdict is a hint, the grade stays the learner's call (FSRS is
// self-graded throughout the app).
function ProductionCard({ card, harakat, revealed, onReveal, family, showKeyboard, onToggleKeyboard, onExploreRoot }) {
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(false);
  const inputRef = useRef(null);

  // Splices a char in at the current cursor position (not just appended),
  // then restores focus + cursor so repeated on-screen key taps feel like
  // typing rather than resetting to the end each time.
  const spliceAtCursor = (before, after) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? input.length;
    const end = el?.selectionEnd ?? input.length;
    const next = before(input, start, end);
    setInput(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(after(start), after(start));
    });
  };

  const insertAtCursor = (ch) => {
    spliceAtCursor(
      (val, start, end) => val.slice(0, start) + ch + val.slice(end),
      (start) => start + ch.length,
    );
  };

  const backspaceAtCursor = () => {
    spliceAtCursor(
      (val, start, end) => (start === end ? val.slice(0, Math.max(0, start - 1)) + val.slice(end) : val.slice(0, start) + val.slice(end)),
      (start, end) => (start === end ? Math.max(0, start - 1) : start),
    );
  };

  const submit = () => {
    setCorrect(checkAnswer(input, card));
    onReveal();
  };

  if (!revealed) {
    // Column layout so each control sits on its own row: prompt, input,
    // keyboard toggle, (keyboard), then the check button underneath.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, marginBottom: SPACE.xs }}>{card.de}</div>
        <input
          ref={inputRef}
          autoFocus
          dir="rtl"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="مَثَلًا: بَيْت"
          style={{
            ...inputStyle, textAlign: 'center', marginTop: 0,
            fontFamily: 'Amiri, serif', fontSize: FONT.arMd, padding: '10px 12px',
          }}
        />
        <button type="button" onClick={onToggleKeyboard} style={linkBtn}>
          <Keyboard size={14} /> {showKeyboard ? 'Tastatur ausblenden' : 'Tastatur einblenden'}
        </button>
        {showKeyboard && (
          <div style={{ width: '100%' }}>
            <ArabicKeyboard onKey={insertAtCursor} onBackspace={backspaceAtCursor} />
          </div>
        )}
        <button onClick={submit} style={primaryBtn}>Antwort prüfen</button>
      </div>
    );
  }

  const verdict = input.trim() ? (correct ? VERDICT.correct : VERDICT.wrong) : null;
  return (
    <>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, marginBottom: SPACE.md }}>{card.de}</div>
      {verdict && (
        <div style={{ fontSize: FONT.base, fontWeight: 600, color: verdict.color, marginBottom: SPACE.md }}>
          {verdict.label}
          {!correct && <span style={{ fontWeight: 400, color: C.textSoft }}> · „{input.trim()}"</span>}
        </div>
      )}
      <ArabicWord card={card} harakat={harakat} />
      <div style={{ marginTop: 14 }}>
        <RootFamily card={card} family={family} onExploreRoot={onExploreRoot} />
        <Example card={card} />
      </div>
    </>
  );
}

// The Arabic -> German prompt: see the word, recall the meaning, self-grade.
function RecognitionCard({ card, harakat, revealed, onReveal, family, onExploreRoot }) {
  return (
    <>
      <ArabicWord card={card} harakat={harakat} />
      {!revealed ? (
        <button onClick={onReveal} style={{ ...primaryBtn, marginTop: 16 }}>Bedeutung zeigen</button>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, marginBottom: SPACE.md }}>{card.de}</div>
          <RootFamily card={card} family={family} onExploreRoot={onExploreRoot} />
          <Example card={card} />
        </div>
      )}
    </>
  );
}

// One vocabulary card, direction-aware. See the two card components above.
export default function Flashcard({ card, direction, harakat, revealed, onReveal, family, showKeyboard, onToggleKeyboard, onExploreRoot }) {
  const badge = BADGE[direction];
  const Card = direction === 'production' ? ProductionCard : RecognitionCard;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        marginBottom: '1.25rem',
      }}
    >
      {badge && (
        <div style={{ ...pill(badge.color), display: 'inline-block', marginBottom: 22 }}>
          {badge.label}
        </div>
      )}
      <Card
        card={card} harakat={harakat} revealed={revealed} onReveal={onReveal} family={family}
        showKeyboard={showKeyboard} onToggleKeyboard={onToggleKeyboard} onExploreRoot={onExploreRoot}
      />
    </div>
  );
}
