import { ChevronRight, Flame, Layers, Puzzle, Sprout } from 'lucide-react';
import { useT } from '../i18n/i18n.jsx';
import { C, card, pill, FONT, SPACE } from '../theme.js';

// Startseite: Begrüßung, Tagesfortschritt (Ziel-Ring + Streak) und die
// wählbaren Lernwerkzeuge. Ein künftiges Tool ist ein weiterer Eintrag im
// tools-Array unten, kein neues Markup.

// Tagesziel-Ring: erledigte Reviews heute im Verhältnis zu (erledigt + noch
// fällig). Ohne fällige Karten und ohne Reviews bleibt der Ring leer statt
// fälschlich "voll" zu wirken.
function GoalRing({ done, goal }) {
  const { t } = useT();
  const size = 64;
  const r = 26;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? done / goal : done > 0 ? 1 : 0;
  return (
    <div
      role="img"
      aria-label={goal > 0 ? t('dashboard.goalRingWithGoal', { done, goal }) : t('dashboard.goalRingNoGoal', { done })}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceMuted} strokeWidth={6} />
        <circle
          className="goal-ring-progress"
          cx={cx} cy={cx} r={r} fill="none" stroke={C.primary} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', lineHeight: 1.1,
      }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.lg, fontWeight: 600, color: C.primary }}>
          {done}
        </span>
        <span style={{ fontSize: 9, color: C.textSoft }}>{t('dashboard.today')}</span>
      </span>
    </div>
  );
}

function StreakBadge({ streak }) {
  const { t, tn } = useT();
  const active = streak > 0;
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Flame size={18} color={active ? C.gold : C.textSoft} fill={active ? C.goldSoft : 'none'} />
        {active && (
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, fontWeight: 600, color: C.gold }}>
            {streak}
          </span>
        )}
      </div>
      <div style={{ fontSize: FONT.xs, color: C.textSoft, marginTop: 2 }}>
        {active ? tn('dashboard.streak', streak) : t('dashboard.streakNone')}
      </div>
    </div>
  );
}

function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={tool.onOpen}
      aria-label={`${tool.name}${tool.badge ? `, ${tool.badge}` : ''}. ${tool.desc}`}
      style={{
        ...card, display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        textAlign: 'left', fontFamily: 'inherit', padding: '1rem 1.25rem',
        marginBottom: SPACE.md, cursor: 'pointer',
      }}
    >
      <span style={{
        width: 42, height: 42, borderRadius: 12, backgroundColor: tool.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={tool.iconColor} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.md, fontWeight: 600, color: C.text }}>
            {tool.name}
          </span>
          {tool.badge && <span style={pill(tool.badgeColor)}>{tool.badge}</span>}
        </span>
        <span style={{ display: 'block', fontSize: FONT.sm, color: C.textSoft, marginTop: 2 }}>{tool.desc}</span>
      </span>
      <ChevronRight size={16} color={C.textSoft} />
    </button>
  );
}

// Deckt sich mit QuizSession.MIN_POOL — hier nur fürs Badge, kein Import
// nötig, weil rein informativ (QuizSession selbst prüft die Schwelle noch
// einmal beim Rundenaufbau).
const QUIZ_MIN_POOL = 4;

export default function Dashboard({ todayTotals, doneToday, streak, quizPoolSize, onOpenFlashcards, onOpenQuiz, onOpenExplorer }) {
  const { t, tn } = useT();
  const hour = new Date().getHours();
  const greeting = hour < 11 ? t('dashboard.greeting.morning') : hour < 18 ? t('dashboard.greeting.day') : t('dashboard.greeting.evening');

  const tools = [
    {
      id: 'flashcards', name: t('dashboard.tools.flashcards.name'), desc: t('dashboard.tools.flashcards.desc'),
      icon: Layers, iconColor: C.primary, iconBg: C.primarySoft,
      badge: todayTotals.due > 0 ? t('dashboard.badgeDue', { due: todayTotals.due }) : null, badgeColor: C.primary,
      onOpen: onOpenFlashcards,
    },
    {
      id: 'quiz', name: t('dashboard.tools.quiz.name'), desc: t('dashboard.tools.quiz.desc'),
      icon: Puzzle, iconColor: C.gold, iconBg: C.goldSoft,
      badge: quizPoolSize >= QUIZ_MIN_POOL ? tn('common.words', quizPoolSize) : null, badgeColor: C.gold,
      onOpen: onOpenQuiz,
    },
    {
      id: 'explorer', name: t('dashboard.tools.explorer.name'), desc: t('dashboard.tools.explorer.desc'),
      icon: Sprout, iconColor: C.textSoft, iconBg: C.surfaceMuted,
      badge: t('dashboard.beta'), badgeColor: C.textSoft,
      onOpen: onOpenExplorer,
    },
  ];

  return (
    <>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.h2, fontWeight: 600, margin: '0 0 0.9rem' }}>
        {greeting}
      </h1>

      <div style={{ ...card, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem' }}>
        <GoalRing done={doneToday} goal={doneToday + todayTotals.due} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {todayTotals.due > 0 ? (
            <div style={{ fontSize: FONT.base }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: FONT.xl, fontWeight: 600, color: C.primary }}>
                {todayTotals.due}
              </span>
              {' '}{t('dashboard.dueSuffix')}
              {todayTotals.fresh > 0 && (
                <span style={{ fontSize: FONT.sm, color: C.textSoft }}> {t('dashboard.freshSuffix', { fresh: todayTotals.fresh })}</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: FONT.base, color: C.textSoft }}>
              {t('dashboard.allLearned')}{todayTotals.fresh > 0 ? t('dashboard.freshWaiting', { fresh: todayTotals.fresh }) : ''}
            </div>
          )}
          <div style={{ fontSize: FONT.xs, color: C.textSoft, marginTop: 3 }}>{t('dashboard.reviewedToday', { done: doneToday })}</div>
        </div>
        <StreakBadge streak={streak} />
      </div>

      <div style={{ fontSize: FONT.sm, fontWeight: 500, color: C.textSoft, marginBottom: SPACE.sm }}>{t('dashboard.toolsHeading')}</div>
      {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
    </>
  );
}
