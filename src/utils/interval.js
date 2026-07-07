// Human-readable German interval formatting for due-date previews.

export function formatInterval(ms) {
  const min = ms / 60000;
  if (min < 1) return 'jetzt';
  if (min < 60) return `${Math.round(min)} Min`;
  const hours = min / 60;
  if (hours < 24) return `${Math.round(hours)} Std`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} Tg`;
  const months = days / 30;
  if (months < 12) return `${Math.round(months)} Mon`;
  return `${(days / 365).toFixed(1)} J`;
}
