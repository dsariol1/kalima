// Human-readable interval formatting for due-date previews. The unit strings
// are language-dependent (see i18n dicts, interval.*); the caller passes a
// bound `t` from useT()/makeT so this stays a pure formatting helper.

export function formatInterval(ms, t) {
  const min = ms / 60000;
  if (min < 1) return t('interval.now');
  if (min < 60) return t('interval.min', { n: Math.round(min) });
  const hours = min / 60;
  if (hours < 24) return t('interval.hr', { n: Math.round(hours) });
  const days = hours / 24;
  if (days < 30) return t('interval.day', { n: Math.round(days) });
  const months = days / 30;
  if (months < 12) return t('interval.month', { n: Math.round(months) });
  return t('interval.year', { n: (days / 365).toFixed(1) });
}
