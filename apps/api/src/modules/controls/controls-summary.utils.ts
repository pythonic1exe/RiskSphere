const DAY_MS = 24 * 60 * 60 * 1000;

export function controlSummaryWindow(now: Date) {
  return { from: now, to: new Date(now.getTime() + 14 * DAY_MS) };
}

export function controlAttentionReason(item: { dueAt: Date; status: string }, now: Date) {
  if (item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && item.dueAt < now) return 'Overdue execution';
  if (item.status !== 'COMPLETED' && item.status !== 'CANCELLED') return 'Upcoming execution';
  return null;
}
