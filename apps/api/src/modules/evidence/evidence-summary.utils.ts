const DAY_MS = 24 * 60 * 60 * 1000;

export function evidenceSummaryWindow(now: Date) {
  return { from: now, to: new Date(now.getTime() + 30 * DAY_MS) };
}

export function evidenceAttentionReason(item: { expiresAt: Date | null; hasVersion: boolean; hasControl: boolean; hasExecution: boolean }, now: Date) {
  if (item.expiresAt && item.expiresAt < now) return 'Expired evidence';
  if (item.expiresAt && item.expiresAt <= new Date(now.getTime() + 30 * DAY_MS)) return 'Expiring soon';
  if (!item.hasVersion) return 'Missing current version';
  if (!item.hasControl) return 'No linked control';
  if (!item.hasExecution) return 'No linked execution';
  return null;
}
