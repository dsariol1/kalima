import { ChevronRight, Flame, Layers, Puzzle } from 'lucide-react';
import { C, card, pill, FONT, SPACE } from '../theme.js';

// Startseite: Begrüßung, Tagesfortschritt (Ziel-Ring + Streak) und die
// wählbaren Lernwerkzeuge. Ein künftiges Tool ist ein weiterer Eintrag im
// tools-Array unten, kein neues Markup.

// Tagesziel-Ring: erledigte Reviews heute im Verhältnis zu (erledigt + noch
// fällig). Ohne fällige Karten und ohne Reviews bleibt der Ring leer statt
// fälschlich "voll" zu wirken.
function GoalRing({ done, goal }) {
  const size = 64;
  const r = 26;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = goal > 0 ? done / goal : done > 0 ? 1 : 0;
  return (
    <div
      role="img"
      aria-label={goal > 0 ? `${done} von ${goal} Karten heute gelernt` : `${done} Karten heute gelernt`}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={C.surfaceMuted} strokeWidth={6} />
        <circle
          cx={cx} cy={cx} r={r} fill="none" stroke={C.primary} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      <span style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Fraunces, serif', fontSize: FONT.lg, fontWeight: 600, color: C.primary,
      }}>
        {done}
      </span>
    </div>
  );
}

function StreakBadge({ streak }) {
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
        {active ? (streak === 1 ? 'Tag-Serie' : 'Tage-Serie') : 'Starte deine Serie'}
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

export default function Dashboard({ todayTotals, doneToday, streak, onOpenFlashcards, onOpenQuiz, onOpenExplorer }) {
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';

  const tools = [
    {
      id: 'flashcards', name: 'Karteikarten', desc: 'Spaced Repetition mit deinen Büchern.',
      icon: Layers, iconColor: C.primary, iconBg: C.primarySoft,
      badge: todayTotals.due > 0 ? `${todayTotals.due} fällig` : null, badgeColor: C.primary,
      onOpen: onOpenFlashcards,
    },
    {
      id: 'quiz', name: 'Quiz', desc: 'Multiple-Choice mit bereits gelernten Wörtern.',
      icon: Puzzle, iconColor: C.gold, iconBg: C.goldSoft,
      badge: null, badgeColor: C.gold,
      onOpen: onOpenQuiz,
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
              {' '}Karten heute fällig
              {todayTotals.fresh > 0 && (
                <span style={{ fontSize: FONT.sm, color: C.textSoft }}> · {todayTotals.fresh} neu</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: FONT.base, color: C.textSoft }}>
              Alles gelernt für heute{todayTotals.fresh > 0 ? ` · ${todayTotals.fresh} neue Karten warten` : ''}
            </div>
          )}
          <div style={{ fontSize: FONT.xs, color: C.textSoft, marginTop: 3 }}>{doneToday} heute wiederholt</div>
        </div>
        <StreakBadge streak={streak} />
      </div>

      <div style={{ fontSize: FONT.sm, fontWeight: 500, color: C.textSoft, marginBottom: SPACE.sm }}>Lernwerkzeuge</div>
      {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}

      {/* Prototyp — vier Demo-Wurzeln (ك ت ب, د ر س, ع م ل, س ك ن). */}
      <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <button
          onClick={onOpenExplorer}
          style={{
            background: 'none', border: 'none', color: C.gold, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: FONT.sm, fontWeight: 500,
          }}
        >
          Wurzel-Explorer (Beta) →
        </button>
      </div>
    </>
  );
}
