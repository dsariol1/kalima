import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Volume2, Plus, Minus, CheckCircle2, Sparkles } from 'lucide-react';
import { C, card, backBtn, linkBtn, primaryBtn, pill } from '../theme.js';
import { BUILTIN_VOCAB, BOOK_META } from '../data/books.js';
import { ROOT_FAMILIES, ROOT_KEYS, WORD_INDEX, normalizeCitation } from '../data/rootFamilies.js';

// Wurzel-Explorer mit vier ausgearbeiteten Demo-Wurzeln (ك ت ب, د ر س,
// ع م ل, س ك ن). Kein statischer Baum: das angeklickte Wort wird zum neuen
// Mittelpunkt, die übrigen ordnen sich radial darum an (CSS-Transform-
// Animation, bewusst ohne Graph-Bibliothek — reicht bei 6–11 Knoten und
// hält das Bundle klein). Umschrift liegt im Datenmodell, wird aber gemäß
// App-Regel nicht angezeigt.
//
// Layout: eigene, breite Bühne (Overlay in App.jsx, maxWidth 1080). Auf
// Desktop Graph links + Detailpanel rechts nebeneinander — ein Knoten-Klick
// aktualisiert das Panel ohne Scrollen. Unter 900px Containerbreite wird
// gestapelt. Nichts ist sticky; der Kopf scrollt normal mit.
//
// Jedes Wort ist in `segments` zerlegt (Wurzelbuchstaben vs. Muster-Zeichen
// wie Präfix/Infix/Langvokal/Endung) — siehe src/data/rootFamilies.js, wo
// `ar`/`bare` daraus abgeleitet werden, nie getrennt gepflegt.

const REL_COLORS = {
  Handlung: C.primary,
  Person: C.gold,
  Ort: 'var(--accent-place)',
  Ergebnis: 'var(--accent-result)',
};

const BOOK_TITLE = Object.fromEntries(BOOK_META.map((b) => [b.id, b.titleDe]));

// Verankerung an den echten Vokabeldaten (Builtin + selbst gelernte
// Explorer-Wörter): Häkchen + Fundstelle für Wörter, die es schon in den
// Lernwortschatz geschafft haben. Match über normalizeCitation (siehe
// rootFamilies.js) statt komplett harakat-freiem Text — sonst würden
// Homographe wie مَدْرَسَة/مُدَرِّسَة verwechselt.
function buildKnownMap(customVocab) {
  const map = new Map();
  for (const v of [...BUILTIN_VOCAB, ...customVocab]) {
    const key = normalizeCitation(v.ar);
    if (!map.has(key)) map.set(key, { book: BOOK_TITLE[v.bookId] || v.bookId, unitDe: v.unitDe });
  }
  return map;
}

// Frequenz als Wort statt Punkte — verständlicher fürs Lernen als eine
// abstrakte Punkteskala (Sterne würden nach Qualität/Bewertung aussehen).
const FREQ_LABEL = { 5: 'Sehr häufig', 4: 'Häufig', 3: 'Gebräuchlich', 2: 'Selten', 1: 'Sehr selten' };

// Knotengröße nach Häufigkeit: wichtige Wörter größer, seltene kleiner —
// die Wortfamilie bekommt so eine visuelle Hierarchie.
const NODE_SIZE = {
  5: { ar: 21, de: 11, pattern: 9.5, pad: [7, 12] },
  4: { ar: 19, de: 10.5, pattern: 9, pad: [6, 11] },
  3: { ar: 18, de: 10, pattern: 8.5, pad: [6, 10] },
  2: { ar: 16, de: 9.5, pattern: 8.5, pad: [5, 9] },
  1: { ar: 15, de: 9, pattern: 8, pad: [5, 8] },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

// Alle Wörter aller Wurzeln zu einem Pool verflacht — Grundlage für Quiz und
// Muster-Linse, die absichtlich wurzelübergreifend arbeiten (Transfer statt
// Auswendiglernen einer einzelnen Familie).
const QUIZ_POOL = ROOT_KEYS.flatMap((key) =>
  ROOT_FAMILIES[key].words.map((w) => ({
    ...w, rootKey: key, root: ROOT_FAMILIES[key].root, rootMeaning: ROOT_FAMILIES[key].rootMeaning,
  }))
);

// Gruppiert denselben Datensatz nach وزن — Grundlage der Muster-Linse.
// Reichhaltigste (am meisten Wurzeln teilende) Muster zuerst.
const PATTERN_GROUPS = (() => {
  const map = new Map();
  for (const w of QUIZ_POOL) {
    if (!map.has(w.pattern)) map.set(w.pattern, { pattern: w.pattern, patternMeaning: w.patternMeaning, words: [] });
    map.get(w.pattern).words.push(w);
  }
  return [...map.values()].sort((a, b) => b.words.length - a.words.length);
})();

// Distraktoren bevorzugt aus (a) gleiche Wurzel/anderes Muster und (b)
// gleiches Muster/andere Wurzel — zwingt zur echten Unterscheidung von
// Wurzel- und Musteranteil, statt nur irgendeine falsche Antwort auszuschliessen.
function pickQuestion(avoidId) {
  let target;
  do {
    target = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)];
  } while (QUIZ_POOL.length > 1 && target.id === avoidId);

  const pool = QUIZ_POOL.filter((w) => w.id !== target.id && w.de !== target.de);
  const sameRoot = shuffle(pool.filter((w) => w.rootKey === target.rootKey));
  const samePattern = shuffle(pool.filter((w) => w.pattern === target.pattern && w.rootKey !== target.rootKey));
  const rest = shuffle(pool.filter((w) => w.rootKey !== target.rootKey && w.pattern !== target.pattern));

  const distractors = [];
  const usedDe = new Set([target.de]);
  for (const bucket of [sameRoot, samePattern, rest]) {
    for (const w of bucket) {
      if (distractors.length >= 3) break;
      if (usedDe.has(w.de)) continue;
      distractors.push(w);
      usedDe.add(w.de);
    }
  }

  return {
    target,
    options: shuffle([target, ...distractors]),
    direction: Math.random() < 0.5 ? 'ar2de' : 'de2ar',
  };
}

// Aktives Muster-Quiz: zeigt zunächst NUR das Wort (bzw. bei umgekehrter
// Frage nur die deutsche Bedeutung). Wurzel- und Musterbedeutung müssen per
// Tipp einzeln aufgedeckt werden — wer ohne Tipp richtig liegt, hat das
// Muster wirklich verinnerlicht, nicht nur abgelesen.
function PatternQuiz({ onExit, onJumpToWord }) {
  const [question, setQuestion] = useState(() => pickQuestion(null));
  const [selected, setSelected] = useState(null);
  const [hints, setHints] = useState({ root: false, pattern: false });
  const [score, setScore] = useState({ correct: 0, total: 0, noHint: 0 });

  const next = () => {
    setQuestion((q) => pickQuestion(q.target.id));
    setSelected(null);
    setHints({ root: false, pattern: false });
  };

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt.id === question.target.id;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      noHint: s.noHint + (isCorrect && !hints.root && !hints.pattern ? 1 : 0),
    }));
  };

  const { target, options, direction } = question;
  const isAr2De = direction === 'ar2de';

  return (
    <div style={{ ...card, padding: '1.25rem 1rem', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12.5, color: C.textSoft, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Sparkles size={14} color={C.gold} /> Muster-Quiz
        </span>
        <span style={{ fontSize: 12.5, color: C.textSoft }}>{score.correct}/{score.total} richtig · {score.noHint} ohne Tipp</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        {isAr2De ? (
          <RootedWord segments={target.segments} size={34} rootColor={REL_COLORS[target.relation] || C.primary} patternColor={C.textSoft} />
        ) : (
          <div style={{ fontSize: 20, fontWeight: 500 }}>{target.de}</div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
        <button onClick={() => setHints((h) => ({ ...h, root: true }))} disabled={hints.root} style={{ ...linkBtn, opacity: hints.root ? 0.4 : 1 }}>
          Tipp: Wurzel
        </button>
        <button onClick={() => setHints((h) => ({ ...h, pattern: true }))} disabled={hints.pattern} style={{ ...linkBtn, opacity: hints.pattern ? 0.4 : 1 }}>
          Tipp: Muster
        </button>
      </div>

      {(hints.root || hints.pattern) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          {hints.root && (
            <div style={{ fontSize: 12, color: C.textSoft, textAlign: 'center' }}>
              <div>Wurzel · {target.root.join(' ')}</div>
              <div style={{ fontWeight: 500 }}>{target.rootMeaning}</div>
            </div>
          )}
          {hints.pattern && (
            <div style={{ fontSize: 12, color: C.textSoft, textAlign: 'center' }}>
              <div dir="rtl">Muster (وزن) · {target.pattern}</div>
              <div style={{ fontWeight: 500, maxWidth: 220 }}>{target.patternMeaning}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 13, color: C.text, textAlign: 'center', marginBottom: 12 }}>
        {isAr2De ? 'Was bedeutet das?' : 'Welches Wort passt?'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {options.map((opt) => {
          const isCorrect = opt.id === target.id;
          const isPicked = selected && opt.id === selected.id;
          let bg = C.bg, border = C.border, color = C.text;
          if (selected) {
            if (isCorrect) { bg = C.primarySoft; border = C.primary; color = C.primary; }
            else if (isPicked) { bg = C.dangerSoft; border = C.danger; color = C.danger; }
          }
          return (
            <button
              key={opt.id}
              onClick={() => answer(opt)}
              disabled={!!selected}
              style={{
                padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${border}`,
                backgroundColor: bg, color, fontFamily: 'inherit', fontSize: 13,
                cursor: selected ? 'default' : 'pointer', textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40,
              }}
            >
              {isAr2De ? opt.de : <RootedWord segments={opt.segments} size={17} rootColor={color} patternColor={color} patternOpacity={0.6} />}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, color: C.textSoft, marginBottom: 10 }}>
            {target.ar} = {target.rootMeaning} (Wurzel) + {target.patternMeaning.split(' — ')[0]} (Muster)
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={next} style={primaryBtn}>Nächste Frage</button>
            <button onClick={() => onJumpToWord(target.rootKey, target.id)} style={linkBtn}>Im Explorer ansehen</button>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button onClick={onExit} style={{ ...linkBtn, justifyContent: 'center' }}><ArrowLeft size={13} /> Zurück zum Explorer</button>
      </div>
    </div>
  );
}

// Muster-Linse: statt eines einzelnen Wurzel-Graphen eine nach وزن
// gruppierte Übersicht über ALLE Familien hinweg — macht sichtbar, dass
// z.B. مَفْعَل bei drei verschiedenen Wurzeln denselben Ortsbezug erzeugt.
// Volle Breite, 2 Spalten auf Desktop.
function PatternLens({ onJumpToWord }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(420px, 100%), 1fr))', gap: 12, alignItems: 'start' }}>
      {PATTERN_GROUPS.map((g) => (
        <div key={g.pattern} style={{ ...card, padding: '0.9rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 22, color: C.primary }}>{g.pattern}</span>
            <span style={{ fontSize: 11, color: C.textSoft }}>{g.words.length} Wörter</span>
          </div>
          <div style={{ fontSize: 12.5, color: C.textSoft, marginBottom: 10, lineHeight: 1.4 }}>{g.patternMeaning}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {g.words.map((w) => (
              <button
                key={`${w.rootKey}-${w.id}`}
                onClick={() => onJumpToWord(w.rootKey, w.id)}
                aria-label={`${w.ar} – ${w.de}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: `1px solid ${C.border}`, borderRadius: 999, padding: '4px 10px',
                  background: C.surface, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RootedWord segments={w.segments} size={15} rootColor={REL_COLORS[w.relation] || C.primary} patternColor={C.textSoft} />
                <span style={{ fontSize: 12, color: C.textSoft }}>— {w.de}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Segmentierte Ansichts-Umschaltung [Wurzeln | Muster | Quiz] — ein
// Navigationskonzept für alle drei Modi statt verstreuter Einzellinks.
function ViewSwitch({ view, onChange }) {
  const seg = (key, label) => (
    <button
      aria-pressed={view === key}
      onClick={() => onChange(key)}
      style={{
        border: 'none', padding: '5px 14px', fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer',
        background: view === key ? C.primarySoft : 'transparent',
        color: view === key ? C.primary : C.textSoft,
        fontWeight: view === key ? 500 : 400,
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', border: `1px solid ${C.border}`, borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
      {seg('graph', 'Wurzeln')}
      {seg('patterns', 'Muster')}
      {seg('quiz', 'Quiz')}
    </div>
  );
}

export default function RootExplorer({ onBack, initialRootKey, initialCenterAr, customVocab = [], onLearnWord }) {
  const [rootKey, setRootKey] = useState(initialRootKey && ROOT_FAMILIES[initialRootKey] ? initialRootKey : 'كتب');
  const [view, setView] = useState('graph'); // 'graph' | 'patterns' | 'quiz'
  const family = ROOT_FAMILIES[rootKey];

  // Karteneinstieg aus der Flashcard: `ar` (nicht `bare`) + normalizeCitation
  // sind homograph-sicher (يَكْتُبُ im Explorer vs. im Buch zitiertes يَكْتُب).
  const initialWord = initialRootKey === rootKey && initialCenterAr
    ? family.words.find((w) => normalizeCitation(w.ar) === normalizeCitation(initialCenterAr))
    : null;
  const [centerId, setCenterId] = useState(initialWord ? initialWord.id : family.defaultCenterId);
  const [showRare, setShowRare] = useState(!!initialWord && initialWord.frequency < 3);

  const known = useMemo(() => buildKnownMap(customVocab), [customVocab]);

  // Ein Sprung-Mechanismus für alles, was zu einem bestimmten Wort in einer
  // bestimmten Familie navigiert: Wurzel-Pills, klickbare Parallelen,
  // Muster-Linse und der Quiz-Rücksprung teilen sich diese eine Funktion.
  const jumpTo = useCallback((targetRootKey, wordId) => {
    const fam = ROOT_FAMILIES[targetRootKey];
    const word = fam.words.find((w) => w.id === wordId) || fam.words.find((w) => w.id === fam.defaultCenterId);
    setRootKey(targetRootKey);
    setCenterId(word.id);
    setShowRare(word.frequency < 3);
    setView('graph');
  }, []);

  const visible = useMemo(
    () => family.words.filter((w) => showRare || w.frequency >= 3),
    [family, showRare]
  );
  const center = visible.find((w) => w.id === centerId) || visible[0];
  const centerKnown = known.get(normalizeCitation(center.ar));
  const satellites = visible.filter((w) => w.id !== center.id);

  // Bühne vermessen: der Ref sitzt auf dem IMMER gerenderten Wurzel-Wrapper
  // (nicht auf dem Graph-Div, das beim Ansichtswechsel unmountet — der
  // ResizeObserver würde beim Unmount 0 melden und der neue Div würde nie
  // beobachtet: Graph kollabierte nach Muster→Wurzeln). Der `> 0`-Guard
  // schluckt 0-Meldungen zusätzlich.
  const wrapRef = useRef(null);
  const [stage, setStage] = useState({ w: 360, vh: 800 });
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => {
      if (el.clientWidth > 0) setStage({ w: el.clientWidth, vh: window.innerHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  // Desktop: Graph links, Detailpanel (380px) rechts. Darunter gestapelt.
  const twoCol = stage.w >= 900;
  const graphW = twoCol ? stage.w - 380 - 24 : stage.w;
  // Graph-Höhe wächst mit dem Viewport statt fixer 420px-Box.
  const graphH = twoCol
    ? Math.min(640, Math.max(440, stage.vh * 0.62))
    : Math.min(480, Math.max(360, stage.vh * 0.55));

  // Auf schmalen Screens tragen Satelliten NUR das arabische Wort (siehe
  // `compact`) — drei Textzeilen (~140px breit) passen bei 7+ Knoten
  // geometrisch nicht auf ~310px Breite, unabhängig vom Radius: der
  // Bogenabstand zwischen Nachbarknoten (2πr/n) muss die Knotenbreite
  // übersteigen, sonst überlappen sie sich immer, egal wie klein r ist.
  const compact = graphW < 420;
  // Radien aus BEIDEN Dimensionen — ry aus der echten Höhe statt rx·Faktor,
  // sonst bleibt vertikal Leerraum bzw. es clippt.
  const rx = Math.min(250, Math.max(55, graphW / 2 - (compact ? 55 : 105)));
  const ry = Math.max(rx * 0.85, graphH / 2 - 85);
  // Ab 8 Satelliten reicht ein einzelner Ring nicht mehr — drei gestaffelte
  // Radien ab 9 Satelliten, zwei ab 8. `denseScale` schrumpft zusätzlich
  // die Knoten selbst, sonst würden sie trotz Staffelung übereinander liegen.
  const ringFactors = satellites.length >= 9 ? [1, 0.78, 0.54] : satellites.length > 7 ? [1, 0.68] : [1];
  const denseScale = satellites.length >= 9 ? 0.76 : satellites.length > 7 ? 0.88 : 1;
  const nodes = satellites.map((w, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / satellites.length;
    const ring = ringFactors[i % ringFactors.length];
    return { w, x: Math.cos(angle) * rx * ring, y: Math.sin(angle) * ry * ring };
  });

  const learnWord = () => {
    if (!onLearnWord) return;
    onLearnWord({
      id: `roots-${center.id}`,
      bookId: 'roots',
      unit: rootKey,
      unitDe: `${family.root.join(' ')} – ${family.rootMeaning}`,
      pos: center.type.toLowerCase().startsWith('verb') ? 'verb' : 'noun',
      ar: center.ar,
      bare: center.bare,
      translit: '',
      de: center.de,
      root: family.root,
      rootMeaning: family.rootMeaning,
      example: center.example,
    });
  };

  // Detailpanel — „die Box, die bleibt": alle Infos zum gewählten Wort.
  const detailPanel = (
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
      {centerKnown ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.primary, marginBottom: 10 }}>
          <CheckCircle2 size={14} />
          Schon in deinem Wortschatz — {centerKnown.book}, {centerKnown.unitDe}
        </div>
      ) : onLearnWord && (
        <button onClick={learnWord} style={{ ...primaryBtn, padding: '6px 14px', fontSize: 12.5, marginBottom: 10 }}>
          Als Vokabel lernen
        </button>
      )}

      {/* وزن — das Wortmuster, prominent statt in der Grammatik-Notiz versteckt. */}
      <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: C.textSoft, fontWeight: 500 }}>Muster (وزن)</span>
          <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 20, color: REL_COLORS[center.relation] || C.primary }}>{center.pattern}</span>
        </div>
        <div style={{ fontSize: 12.5, color: C.textSoft, lineHeight: 1.4 }}>{center.patternMeaning}</div>
      </div>

      {/* Parallelen aus anderen Wurzeln, gleiches Muster — klickbar, wenn
          das Wort tatsächlich Teil einer ausgearbeiteten Familie ist (dann
          springt der Explorer dorthin); sonst nur Anzeige. */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.textSoft, fontWeight: 500, marginBottom: 6 }}>Gleiches Muster, andere Wurzeln</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {center.parallels.map((p) => {
            const match = WORD_INDEX.get(normalizeCitation(p.ar));
            const clickable = match && !(match.rootKey === rootKey && match.wordId === center.id);
            const Tag = clickable ? 'button' : 'span';
            return (
              <Tag
                key={p.ar}
                onClick={clickable ? () => jumpTo(match.rootKey, match.wordId) : undefined}
                style={{
                  border: `1px solid ${clickable ? C.primary : C.border}`, borderRadius: 999, padding: '4px 10px',
                  display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12.5, fontFamily: 'inherit',
                  background: clickable ? C.primarySoft : 'transparent', cursor: clickable ? 'pointer' : 'default',
                }}
              >
                <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 15, color: clickable ? C.primary : C.text }}>{p.ar}</span>
                <span style={{ color: clickable ? C.primary : C.textSoft }}>— {p.de}</span>
              </Tag>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <div dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 18, marginBottom: 3 }}>{center.example.ar}</div>
        <div style={{ fontSize: 13, color: C.textSoft, fontStyle: 'italic' }}>„{center.example.de}"</div>
      </div>
    </div>
  );

  return (
    <div ref={wrapRef}>
      <button onClick={onBack} style={{ ...backBtn, marginBottom: '0.9rem' }}><ArrowLeft size={15} /> Zurück</button>

      {/* Kopfzeile: Wurzel-Pills (nur in der Graph-Ansicht relevant — Muster
          und Quiz arbeiten wurzelübergreifend) + Ansichts-Umschalter. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {view === 'graph' && ROOT_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => jumpTo(key, ROOT_FAMILIES[key].defaultCenterId)}
            style={{
              ...pill(key === rootKey ? C.primary : C.border),
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: key === rootKey ? C.primarySoft : 'transparent',
              color: key === rootKey ? C.primary : C.textSoft,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 14 }}>
              {ROOT_FAMILIES[key].root.join(' ')}
            </span>
            {ROOT_FAMILIES[key].rootMeaning.split(',')[0]}
          </button>
        ))}
        <div style={{ marginInlineStart: 'auto' }}>
          <ViewSwitch view={view} onChange={setView} />
        </div>
      </div>

      {/* Sektions-Headline: linksbündige Leseachse statt Zentrier-Monotonie. */}
      {view === 'graph' && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
          <span dir="rtl" style={{ fontFamily: 'Amiri, serif', fontSize: 34, letterSpacing: 8, color: C.primary, fontWeight: 700, lineHeight: 1.2 }}>
            {family.root.join(' ')}
          </span>
          <span style={{ fontSize: 13, color: C.textSoft }}>Wurzel · {family.rootMeaning}</span>
        </div>
      )}
      {view === 'patterns' && (
        <div style={{ marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 19, fontWeight: 600 }}>Muster (وزن) über alle Wurzeln</span>
          <span style={{ fontSize: 12.5, color: C.textSoft, marginInlineStart: 10 }}>
            Gleiches Muster = gleiche Funktion — egal, welche Wurzel eingesetzt wird.
          </span>
        </div>
      )}

      {view === 'quiz' && <PatternQuiz onExit={() => setView('graph')} onJumpToWord={jumpTo} />}

      {view === 'patterns' && <PatternLens onJumpToWord={jumpTo} />}

      {view === 'graph' && (
        <div style={{ display: 'grid', gridTemplateColumns: twoCol ? 'minmax(0, 1fr) 380px' : '1fr', gap: 24, alignItems: 'start' }}>
          <div>
            <div style={{ ...card, padding: '0.5rem' }}>
              {/* Graph-Fläche — füllt Spaltenbreite und wächst mit dem Viewport. */}
              <div style={{ position: 'relative', height: graphH, overflow: 'hidden' }}>
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
                  const wKnown = known.get(normalizeCitation(w.ar));
                  return (
                    <button
                      key={w.id}
                      onClick={() => setCenterId(w.id)}
                      aria-label={`${w.ar} – ${w.de}`}
                      title={wKnown ? `${FREQ_LABEL[w.frequency]} · schon in ${wKnown.book}` : FREQ_LABEL[w.frequency]}
                      style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                        transition: 'transform 0.5s ease',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                        background: C.surface,
                        border: `${w.frequency >= 4 ? 2 : 1}px solid ${relColor}`,
                        borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                        padding: compact ? '6px 9px' : `${size.pad[0] * denseScale}px ${size.pad[1] * denseScale}px`,
                        opacity: w.frequency <= 2 ? 0.85 : 1,
                      }}
                    >
                      {wKnown && (
                        <CheckCircle2
                          size={13} color={C.primary}
                          style={{ position: 'absolute', top: -5, insetInlineEnd: -5, background: C.surface, borderRadius: 999 }}
                        />
                      )}
                      <RootedWord segments={w.segments} size={(compact ? 18 : size.ar) * denseScale} rootColor={relColor} patternColor={C.textSoft} />
                      {!compact && (
                        <>
                          <span style={{ fontSize: size.de * denseScale, color: C.textSoft }}>{w.de}</span>
                          <span dir="rtl" style={{ fontSize: size.pattern * denseScale, color: C.textSoft, opacity: 0.7 }}>{w.pattern}</span>
                        </>
                      )}
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
            </div>

            {/* Unterzeile: Hinweis · Legende · Mehr/Weniger — linksbündig. */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <span style={{ fontSize: 11.5, color: C.textSoft }}>Tippe ein Wort, um es ins Zentrum zu holen.</span>
              {Object.entries(REL_COLORS).map(([rel, color]) => (
                <span key={rel} style={pill(color)}>{rel}</span>
              ))}
              <button onClick={() => setShowRare((s) => !s)} style={linkBtn}>
                {showRare ? <Minus size={14} /> : <Plus size={14} />}
                {showRare ? 'Seltene Ableitungen ausblenden' : 'Weitere Ableitungen'}
              </button>
            </div>
          </div>

          {detailPanel}
        </div>
      )}
    </div>
  );
}
