const DAY_MS = 24 * 60 * 60 * 1000;

export function riskSummaryWindow(now: Date) {
  return { from: now, to: new Date(now.getTime() + 30 * DAY_MS) };
}

export function riskAttentionReason(item: { severity: string | null; hasTreatment: boolean; nextReviewAt: Date | null }, now: Date) {
  if ((item.severity === 'CRITICAL' || item.severity === 'HIGH') && !item.hasTreatment) return 'High risk without treatment';
  if (item.nextReviewAt && item.nextReviewAt <= now) return 'Review overdue';
  if (item.nextReviewAt) return 'Review due soon';
  if (!item.severity) return 'Risk has no assessment';
  return null;
}
