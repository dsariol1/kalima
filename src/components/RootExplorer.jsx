import { useMemo, useState } from 'react';
import { Volume2, Plus, Minus, CheckCircle2, Sparkles } from 'lucide-react';
import { C, card, backBtn, linkBtn, primaryBtn, pill } from '../theme.js';
import { BUILTIN_VOCAB, BOOK_META } from '../data/books.js';
import { ROOT_FAMILIES, ROOT_KEYS } from '../data/rootFamilies.js';

// PROTOTYP — Wurzel-Explorer mit vier ausgearbeiteten Demo-Wurzeln
// (ك ت ب, د ر س, ع م ل, س ك ن). Kein statischer Baum: das angeklickte Wort
// wird zum neuen Mittelpunkt, die übrigen ordnen sich radial darum an
// (CSS-Transform-Animation, bewusst ohne Graph-Bibliothek — bei 6–11 Knoten
// reicht Eigenbau und hält das Bundle klein). Umschrift liegt im
// Datenmodell, wird aber gemäß App-Regel nicht angezeigt.
//
// Jedes Wort ist in `segments` zerlegt (Wurzelbuchstaben vs. Muster-Zeichen
// wie Präfix/Infix/Langvokal/Endung) — siehe src/data/rootFamilies.js, wo
// `ar`/`bare` daraus abgeleitet werden, nie getrennt gepflegt.

const REL_COLORS = {
  Handlung: C.primary,
  Person: C.gold,
  Ort: '#3A6B8C',
  Ergebnis: '#7C5CBF',
};

// Default-Einstiegswort pro Wurzel — ein konkretes, bekanntes Nomen statt
// des abstrakten Verbs, damit der erste Eindruck greifbar ist.
const DEFAULT_CENTER = { 'كتب': 'kitab', 'درس': 'madrasa', 'عمل': 'amal', 'سكن': 'maskan' };

// Verankerung an den echten Vokabeldaten: Wörter einer Demo-Wurzel, die
// bereits in einem Buch stecken, bekommen ein Häkchen + Fundstelle. Match
// NICHT über den komplett harakat-freien `bare`-Text — das würde Homographe
// verwechseln, die sich nur durch interne Diakritika unterscheiden (z.B.
// مَدْرَسَة "Schule" vs. مُدَرِّسَة "Lehrerin" — beide werden ohne Harakat zu
// "مدرسة"). Stattdessen wird nur die auslautende Fallvokal-Endung entfernt
// (z.B. يَكْتُبُ vs. das im Buch zitierte يَكْتُب), interne Diakritika bleiben
// erhalten und unterscheiden die Wörter weiterhin.
const TRAILING_HARAKAT = /[ًٌٍَُِّْ]+$/;
const normalizeCitation = (ar) => ar.replace(TRAILING_HARAKAT, '');
const BOOK_TITLE = Object.fromEntries(BOOK_META.map((b) => [b.id, b.titleDe]));
const KNOWN_BY_CITATION = new Map();
for (const v of BUILTIN_VOCAB) {
  const key = normalizeCitation(v.ar);
  if (!KNOWN_BY_CITATION.has(key)) {
    KNOWN_BY_CITATION.set(key, { book: BOOK_TITLE[v.bookId] || v.bookId, unitDe: v.unitDe });
  }
}

// Frequenz als Wort statt Punkte — verständlicher fürs Lernen als eine
// abstrakte Punkteskala (Sterne würden nach Qualität/Bewertung aussehen).
const FREQ_LABEL = { 5: 'Sehr häufig', 4: 'Häufig', 3: 'Gebräuchlich', 2: 'Selten', 1: 'Sehr selten' };

// Knotengröße nach Häufigkeit: wichtige Wörter größer, seltene kleiner —
// die Wortfamilie bekommt so eine visuelle Hierarchie.
const NODE_SIZE = {
  5: { ar: 21, de: 11, pattern: 9.5, pad: '7px 12px' },
  4: { ar: 19, de: 10.5, pattern: 9, pad: '6px 11px' },
  3: { ar: 18, de: 10, pattern: 8.5, pad: '6px 10px' },
  2: { ar: 16, de: 9.5, pattern: 8.5, pad: '5px 9px' },
  1: { ar: 15, de: 9, pattern: 8, pad: '5px 8px' },
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Rendert ein Wort segmentweise: Wurzelbuchstaben in `rootColor` (kräftig),
// Muster-Zeichen (Präfixe/Infixe/Langvokale/Endungen) in `patternColor`
// (gedämpft). So wird sichtbar, WIE ein Wort aus Wurzel + Schablone entsteht,
// statt es nur zu behaupten. Reihenfolge der Segmente = Lesereihenfolge,
// der dir="rtl"-Container übernimmt die visuelle Spiegelung automatisch.
function RootedWord({ segments, size, rootColor, patternColor, patternOpacity = 0.55 }) {
  return (
    <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: size }}>
      {segments.map((s, i) => (
        <span key={i} style={{ color: s.root ? rootColor : patternColor, opacity: s.root ? 1 : patternOpacity }}>
          {s.t}
        </span>
      ))}
    </span>
  );
}

// Alle Wörter aller Wurzeln zu einem Pool verflacht — Grundlage für das
// Muster-Quiz, das absichtlich wurzelübergreifend fragt (Punkt 8: Transfer
// statt Auswendiglernen einer einzelnen Familie).
const QUIZ_POOL = ROOT_KEYS.flatMap((key) =>
  ROOT_FAMILIES[key].words.map((w) => ({
    ...w, rootKey: key, root: ROOT_FAMILIES[key].root, rootMeaning: ROOT_FAMILIES[key].rootMeaning,
  }))
);

function pickQuestion(avoidId) {
  let target;
  do {
    target = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
  } while (QUIZ_POOL.length > 1 && target.id === avoidId);
  const distractors = shuffle(QUIZ_POOL.filter((w) => w.id !== target.id && w.de !== target.de)).slice(0, 3);
  return { target, options: shuffle([target.de, ...distractors.map((d) => d.de)]) };
}

// Aktives Muster-Quiz: zeigt ein Wort (Wurzel + Muster bereits farblich
// zerlegt, wie im Explorer), aber nicht die Bedeutung. Der Lernende soll sie
// aus Wurzelbedeutung + Musterbedeutung selbst erschliessen, statt sie
// auswendig gelernt zu haben — das ist der eigentliche Transfer-Test.
function PatternQuiz({ onExit }) {
  const [question, setQuestion] = useState(() => pickQuestion(null));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const next = () => {
    setQuestion((q) => pickQuestion(q.target.id));
    setSelected(null);
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    setScore((s) => ({ correct: s.correct + (opt === question.target.de ? 1 : 0), total: s.total + 1 }));
  };

  const { target, options } = question;
  const relColor = REL_COLORS[target.relation] || C.primary;

  return (
    <div style={{ ...card, padding: '1.25rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, color: C.textSoft, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={14} color={C.gold} /> Muster-Quiz
        </span>
        <span style={{ fontSize: 12.5, color: C.textSoft }}>{score.correct}/{score.total} richtig</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <RootedWord segments={target.segments} size={34} rootColor={relColor} patternColor={C.textSoft} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: C.textSoft, textAlign: 'center' }}>
          <div>Wurzel · {target.root.join(' ')}</div>
          <div style={{ fontWeight: 500 }}>{target.rootMeaning}</div>
        </div>
        <div style={{ fontSize: 12, color: C.textSoft, textAlign: 'center' }}>
          <div dir="rtl">Muster (وزن) · {target.pattern}</div>
          <div style={{ fontWeight: 500, maxWidth: 220 }}>{target.patternMeaning}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: C.text, textAlign: 'center', marginBottom: 12 }}>Was bedeutet das?</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {options.map((opt) => {
          const isCorrect = opt === target.de;
          const isPicked = opt === selected;
          let bg = C.bg, border = C.border, color = C.text;
          if (selected) {
            if (isCorrect) { bg = C.primarySoft; border = C.primary; color = C.primary; }
            else if (isPicked) { bg = C.dangerSoft; border = C.danger; color = C.danger; }
          }
          return (
            <button
              key={opt}
              onClick={() => answer(opt)}
              disabled={!!selected}
              style={{
                padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${border}`,
                backgroundColor: bg, color, fontFamily: 'inherit', fontSize: 13,
                cursor: selected ? 'default' : 'pointer', textAlign: 'center',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: C.textSoft, marginBottom: 10 }}>
            {target.ar} = {target.rootMeaning} (Wurzel) + {target.patternMeaning.split(' — ')[0]} (Muster)
          </div>
          <button onClick={next} style={primaryBtn}>Nächste Frage</button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button onClick={onExit} style={linkBtn}>← Zurück zum Explorer</button>
      </div>
    </div>
  );
}

export default function RootExplorer({ onBack, initialRootKey, initialCenterBare }) {
  const [rootKey, setRootKey] = useState(initialRootKey && ROOT_FAMILIES[initialRootKey] ? initialRootKey : 'كتب');
  const [mode, setMode] = useState('explore'); // 'explore' | 'quiz'
  const family = ROOT_FAMILIES[rootKey];

  const initialWord = initialRootKey === rootKey && initialCenterBare
    ? family.words.find((w) => w.bare === initialCenterBare)
    : null;
  const [centerId, setCenterId] = useState(initialWord ? initialWord.id : DEFAULT_CENTER[rootKey]);
  const [showRare, setShowRare] = useState(!!initialWord && initialWord.frequency < 3);

  const selectRoot = (key) => {
    setRootKey(key);
    setCenterId(DEFAULT_CENTER[key]);
    setShowRare(false);
  };

  const visible = useMemo(
    () => family.words.filter((w) => showRare || w.frequency >= 3),
    [family, showRare]
  );
  const center = visible.find((w) => w.id === centerId) || visible[0];
  const centerKnown = KNOWN_BY_CITATION.get(normalizeCitation(center.ar));
  const satellites = visible.filter((w) => w.id !== center.id);

  // Radiale Anordnung: Mittelpunkt (0,0), Satelliten gleichmäßig verteilt.
  // Ellipse statt Kreis, damit es auf schmalen Screens nicht überläuft.
  const rx = 128, ry = 158;
  const nodes = satellites.map((w, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / satellites.length;
    return { w, x: Math.cos(angle) * rx, y: Math.sin(angle) * ry };
  });

  return (
    <div>
      <button onClick={onBack} style={{ ...backBtn, marginBottom: '1rem' }}>← Zurück</button>

      {/* Wurzel-Umschalter — mehrere Wortfamilien statt einer einzigen. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
        {ROOT_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => selectRoot(key)}
            style={{
              ...pill(key === rootKey ? C.primary : C.border),
              backgroundColor: key === rootKey ? C.primarySoft : 'transparent',
              color: key === rootKey ? C.primary : C.textSoft,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 14, marginInlineEnd: 5 }}>
              {ROOT_FAMILIES[key].root.join(' ')}
            </span>
            {ROOT_FAMILIES[key].rootMeaning.split(',')[0]}
          </button>
        ))}
      </div>

      {mode === 'quiz' ? (
        <PatternQuiz onExit={() => setMode('explore')} />
      ) : (
        <>
          {/* Wurzel-Orientierung: bleibt beim Scrollen oben sichtbar, damit
              man bei jedem angeklickten Wort im Blick behält, welche Wurzel
              man gerade erkundet. */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 5, backgroundColor: C.bg,
            padding: '8px 0', marginBottom: 6, textAlign: 'center',
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 24, letterSpacing: 6, color: C.primary, fontWeight: 700 }}>
              {family.root.join(' ')}
            </span>
            <span style={{ fontSize: 12.5, color: C.textSoft, marginInlineStart: 10 }}>
              Wurzel · {family.rootMeaning}
            </span>
          </div>

          <div style={{ ...card, padding: '1.25rem 1rem', marginBottom: '1rem' }}>
            {/* Graph-Fläche */}
            <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
              {/* Verbindungslinien: rotierte Divs vom Zentrum aus, animiert. */}
              {nodes.map(({ w, x, y }) => {
                const dist = Math.sqrt(x * x + y * y);
                const angleDeg = (Math.atan2(y, x) * 180) / Math.PI;
                return (
                  <div
                    key={`line-${w.id}`}
                    style={{
                      position: 'absolute', left: '50%', top: '50%',
                      width: dist, height: 2, backgroundColor: REL_COLORS[w.relation] || C.border,
                      opacity: 0.35, transformOrigin: '0 50%',
                      transform: `rotate(${angleDeg}deg)`,
                      transition: 'transform 0.5s ease, width 0.5s ease',
                    }}
                  />
                );
              })}

              {/* Satelliten — Größe + Randstärke nach Häufigkeit, Wurzelbuchstaben
                  farbig hervorgehoben, Muster-Zeichen gedämpft. */}
              {nodes.map(({ w, x, y }) => {
                const size = NODE_SIZE[w.frequency];
                const relColor = REL_COLORS[w.relation] || C.border;
                const known = KNOWN_BY_CITATION.get(normalizeCitation(w.ar));
                return (
                  <button
                    key={w.id}
                    onClick={() => setCenterId(w.id)}
                    title={known ? `${FREQ_LABEL[w.frequency]} · schon in ${known.book}` : FREQ_LABEL[w.frequency]}
                    style={{
                      position: 'absolute', left: '50%', top: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      transition: 'transform 0.5s ease',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                      background: C.surface,
                      border: `${w.frequency >= 4 ? 2 : 1}px solid ${relColor}`,
                      borderRadius: 12, padding: size.pad, cursor: 'pointer', fontFamily: 'inherit',
                      opacity: w.frequency <= 2 ? 0.85 : 1,
                    }}
                  >
                    {known && (
                      <CheckCircle2
                        size={13} color={C.primary}
                        style={{ position: 'absolute', top: -5, insetInlineEnd: -5, background: C.surface, borderRadius: 999 }}
                      />
                    )}
                    <RootedWord segments={w.segments} size={size.ar} rootColor={relColor} patternColor={C.textSoft} />
                    <span style={{ fontSize: size.de, color: C.textSoft }}>{w.de}</span>
                    <span dir="rtl" style={{ fontSize: size.pattern, color: C.textSoft, opacity: 0.7 }}>{w.pattern}</span>
                  </button>
                );
              })}

              {/* Mittelpunkt */}
              <div
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  background: C.primary, color: '#FFFFFF', borderRadius: 16,
                  padding: '12px 18px', boxShadow: '0 4px 14px rgba(15,118,110,0.35)',
                  transition: 'transform 0.5s ease',
                }}
              >
                {centerKnown && (
                  <CheckCircle2
                    size={15} color={C.primary}
                    style={{ position: 'absolute', top: -6, insetInlineEnd: -6, background: C.surface, borderRadius: 999 }}
                  />
                )}
                <RootedWord segments={center.segments} size={30} rootColor="#FFFFFF" patternColor="#FFFFFF" patternOpacity={0.55} />
                <span style={{ fontSize: 12 }}>{center.de}</span>
                <span dir="rtl" style={{ fontSize: 11, opacity: 0.75 }}>{center.pattern}</span>
              </div>
            </div>

            {/* Legende + Mehr/Weniger */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {Object.entries(REL_COLORS).map(([rel, color]) => (
                <span key={rel} style={pill(color)}>{rel}</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setShowRare((s) => !s)} style={linkBtn}>
                {showRare ? <Minus size={14} /> : <Plus size={14} />}
                {showRare ? 'Seltene Ableitungen ausblenden' : 'Weitere Ableitungen'}
              </button>
              <button onClick={() => setMode('quiz')} style={linkBtn}>
                <Sparkles size={14} /> Muster-Quiz starten
              </button>
            </div>
          </div>

          {/* Detailkarte zum aktuellen Mittelpunkt */}
          <div style={{ ...card, padding: '1.1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
              <span style={pill(REL_COLORS[center.relation] || C.textSoft)}>{center.relation} · {center.type}</span>
              <span style={{ fontSize: 11.5, color: C.textSoft, marginInlineStart: 'auto', marginInlineEnd: 8 }}>{FREQ_LABEL[center.frequency]}</span>
              <button
                disabled
                title="Audio folgt später"
                style={{ ...linkBtn, color: C.textSoft, cursor: 'default', opacity: 0.5 }}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <RootedWord segments={center.segments} size={30} rootColor={REL_COLORS[center.relation] || C.primary} patternColor={C.textSoft} />
            <div style={{ fontSize: 15, fontWeight: 500, margin: '4px 0 6px' }}>{center.de}</div>
            {centerKnown && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.primary, marginBottom: 10 }}>
                <CheckCircle2 size={14} />
                Schon in deinem Wortschatz — {centerKnown.book}, {centerKnown.unitDe}
              </div>
            )}

            {/* وزن — das Wortmuster, prominent statt in der Grammatik-Notiz versteckt. */}
            <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', marginTop: centerKnown ? 0 : 4, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 500 }}>Muster (وزن)</span>
                <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 20, color: REL_COLORS[center.relation] || C.primary }}>{center.pattern}</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.textSoft, lineHeight: 1.4 }}>{center.patternMeaning}</div>
            </div>

            {/* Parallelen aus anderen Wurzeln, gleiches Muster — der Transfer,
                der später das eigenständige Erschliessen neuer Wörter trägt. */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.textSoft, fontWeight: 500, marginBottom: 6 }}>Gleiches Muster, andere Wurzeln</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {center.parallels.map((p) => (
                  <span
                    key={p.ar}
                    style={{
                      border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 10px',
                      display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12.5,
                    }}
                  >
                    <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 15 }}>{p.ar}</span>
                    <span style={{ color: C.textSoft }}>— {p.de}</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
              <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 18, marginBottom: 3 }}>{center.example.ar}</div>
              <div style={{ fontSize: 13, color: C.textSoft, fontStyle: 'italic' }}>„{center.example.de}"</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
