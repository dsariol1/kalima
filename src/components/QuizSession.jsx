import { useMemo, useState } from 'react';
import { ArrowLeft, Puzzle, Sparkles } from 'lucide-react';
import { cardId, isUnlocked } from '../srs/cards.js';
import { useT, useLang } from '../i18n/i18n.jsx';
import { meaning } from '../i18n/content.js';
import { C, card, backBtn, primaryBtn, FONT, SPACE } from '../theme.js';
import ProgressBar from './ProgressBar.jsx';

// Multiple-Choice-Quiz über bereits gelernte Wörter (Recognition-Karte
// mindestens einmal bewertet). Bewusst OHNE Scheduler- und Persistenz-
// Anbindung: kein saveProgress, kein logReview — der Score lebt nur in
// dieser Session, Streak und Tagesring bleiben karteikartengetrieben.

const ROUND_LENGTH = 10;
const MIN_POOL = 4;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Eine Runde vorab: N Targets ohne Wiederholung, Richtung je Frage zufällig.
// Distraktoren gestuft (gleiches Buch + Wortart → gleiches Buch → Rest),
// dedupliziert auf den ANTWORTTEXT (de bzw. bare) — Synonyme über Bücher
// hinweg dürfen nie als zwei identisch lautende Optionen auftauchen.
function buildRound(pool, lang) {
  const targets = shuffle(pool).slice(0, Math.min(ROUND_LENGTH, pool.length));
  return targets.map((target) => {
    const direction = Math.random() < 0.5 ? 'ar2de' : 'de2ar';
    const answerText = (w) => (direction === 'ar2de' ? meaning(w, lang) : w.bare);
    const rest = pool.filter((w) => w.id !== target.id);
    const buckets = [
      shuffle(rest.filter((w) => w.bookId === target.bookId && w.pos === target.pos)),
      shuffle(rest.filter((w) => w.bookId === target.bookId)),
      shuffle(rest),
    ];
    const distractors = [];
    const usedIds = new Set([target.id]);
    const usedText = new Set([answerText(target)]);
    for (const bucket of buckets) {
      for (const w of bucket) {
        if (distractors.length >= 3) break;
        if (usedIds.has(w.id) || usedText.has(answerText(w))) continue;
        distractors.push(w);
        usedIds.add(w.id);
        usedText.add(answerText(w));
      }
    }
    return { target, direction, options: shuffle([target, ...distractors]) };
  });
}

// Score-Stufe als Übersetzungs-Schlüssel (Text kommt aus den i18n-Dicts).
function resultKey(correct, total) {
  const pct = total > 0 ? correct / total : 0;
  if (pct === 1) return 'quiz.result.perfect';
  if (pct >= 0.7) return 'quiz.result.strong';
  if (pct >= 0.4) return 'quiz.result.good';
  return 'quiz.result.keepGoing';
}

export default function QuizSession({ allItems, progressMap, onExit, onGoFlashcards }) {
  const { t } = useT();
  const lang = useLang();
  // Gelernt-Pool über das bestehende Gating: isUnlocked('production', …)
  // ist exakt "Recognition-Karte mindestens einmal bewertet".
  const pool = useMemo(
    () => allItems.filter((v) => isUnlocked('production', progressMap[cardId(v.id, 'recognition')])),
    [allItems, progressMap]
  );

  const [round, setRound] = useState(() => (pool.length >= MIN_POOL ? buildRound(pool, lang) : []));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);

  const restart = () => {
    setRound(buildRound(pool, lang));
    setIndex(0);
    setSelected(null);
    setCorrect(0);
  };

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <button onClick={onExit} style={backBtn}>
        <ArrowLeft size={15} /> {t('common.start')}
      </button>
      <span style={{ fontSize: FONT.sm, color: C.textSoft, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <Puzzle size={14} color={C.gold} /> {t('quiz.label')}
      </span>
    </div>
  );

  if (pool.length < MIN_POOL) {
    return (
      <div>
        {header}
        <div style={{ ...card, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Puzzle size={22} color={C.gold} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: SPACE.sm }}>
            {t('quiz.notEnoughTitle')}
          </div>
          <div style={{ fontSize: FONT.base, color: C.textSoft }}>
            {t('quiz.notEnoughBody', { min: MIN_POOL })}
          </div>
          <button onClick={onGoFlashcards} style={{ ...primaryBtn, marginTop: 16 }}>
            {t('quiz.toFlashcards')}
          </button>
        </div>
      </div>
    );
  }

  if (index >= round.length) {
    return (
      <div>
        {header}
        <div style={{ ...card, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <Sparkles size={22} color={C.gold} style={{ marginBottom: 10 }} />
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, marginBottom: SPACE.sm }}>{t('quiz.done')}</div>
          <div style={{ fontSize: FONT.base, color: C.textSoft }}>
            {t('quiz.score', { correct, total: round.length })} {t(resultKey(correct, round.length))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 16 }}>
            <button onClick={restart} style={primaryBtn}>{t('quiz.again')}</button>
            <button onClick={onExit} style={backBtn}>{t('quiz.toHome')}</button>
          </div>
        </div>
      </div>
    );
  }

  const { target, direction, options } = round[index];
  const isAr2De = direction === 'ar2de';
  const isLast = index === round.length - 1;

  const answer = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt.id === target.id) setCorrect((c) => c + 1);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
  };

  return (
    <div>
      {header}
      <div style={{ ...card, padding: '1.25rem' }}>
        <ProgressBar pct={index / round.length} />
        <div style={{ fontSize: FONT.sm, color: C.textSoft, textAlign: 'center', margin: `8px 0 ${SPACE.lg}px` }}>
          {t('quiz.progress', { n: index + 1, total: round.length, correct })}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          {isAr2De ? (
            <div dir="rtl" lang="ar" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arLg, lineHeight: 1.4, color: C.text }}>
              {target.ar}
            </div>
          ) : (
            <div style={{ fontSize: FONT.xl, fontWeight: 500 }}>{meaning(target, lang)}</div>
          )}
        </div>

        <div style={{ fontSize: FONT.sm, color: C.text, textAlign: 'center', marginBottom: SPACE.md }}>
          {isAr2De ? t('quiz.whatMeaning') : t('quiz.whichWord')}
        </div>

        <div className="quiz-options-grid">
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
                  backgroundColor: bg, color, fontFamily: 'inherit', fontSize: FONT.base,
                  cursor: selected ? 'default' : 'pointer', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44,
                }}
              >
                {isAr2De ? meaning(opt, lang) : (
                  <span dir="rtl" lang="ar" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arSm, lineHeight: 1.3 }}>{opt.ar}</span>
                )}
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: FONT.base, color: C.text, marginBottom: SPACE.md }}>
              <span dir="rtl" lang="ar" style={{ fontFamily: 'Amiri, serif', fontSize: FONT.arSm }}>{target.ar}</span> = {meaning(target, lang)}
            </div>
            <button onClick={next} style={primaryBtn}>
              {isLast ? t('quiz.showResult') : t('quiz.nextQuestion')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
