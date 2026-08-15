import type { DashboardAttentionItem, DashboardUpcomingItem } from './dashboard.types';

const DASHBOARD_HORIZON_MS = 30 * 24 * 60 * 60 * 1000;

type AttentionInput = {
  risks?: Array<{ id: string; title: string; reason: string; severity?: string; dueAt?: Date | string | null }>;
  controls?: Array<{ id: string; controlId?: string; title: string; reason: string; dueAt?: Date | string | null }>;
  evidence?: Array<{ id: string; title: string; reason: string; dueAt?: Date | string | null }>;
  findings?: Array<{ id: string; title: string; reason: string; severity?: string; dueAt?: Date | string | null }>;
  tasks?: Array<{ id: string; title: string; reason: string; priority?: string; dueAt?: Date | string | null }>;
};

function iso(value: Date | string | null | undefined) { return value ? new Date(value).toISOString() : null; }

function attentionRank(item: DashboardAttentionItem) {
  const overdue = /overdue|expired/i.test(item.reason);
  const level = item.priority === 'CRITICAL' || item.priority === 'HIGH' ? item.priority : undefined;
  if (overdue && level === 'CRITICAL') return 0;
  if (overdue && level === 'HIGH') return 1;
  if (level === 'CRITICAL') return 2;
  if (/due soon|upcoming/i.test(item.reason)) return 3;
  return 4;
}

export function buildDashboardAttention(input: AttentionInput): DashboardAttentionItem[] {
  const items: DashboardAttentionItem[] = [];
  for (const item of input.risks ?? []) items.push({ id: `risk:${item.id}`, entityType: 'RISK', entityId: item.id, title: item.title, reason: item.reason, ...(item.severity ? { priority: item.severity } : {}), dueAt: iso(item.dueAt) });
  for (const item of input.controls ?? []) { const entityId = item.controlId ?? item.id; items.push({ id: `control:${entityId}`, entityType: 'CONTROL', entityId, title: item.title, reason: item.reason, dueAt: iso(item.dueAt) }); }
  for (const item of input.evidence ?? []) items.push({ id: `evidence:${item.id}`, entityType: 'EVIDENCE', entityId: item.id, title: item.title, reason: item.reason, dueAt: iso(item.dueAt) });
  for (const item of input.findings ?? []) items.push({ id: `finding:${item.id}`, entityType: 'FINDING', entityId: item.id, title: item.title, reason: item.reason, ...(item.severity ? { priority: item.severity } : {}), dueAt: iso(item.dueAt) });
  for (const item of input.tasks ?? []) items.push({ id: `task:${item.id}`, entityType: 'TASK', entityId: item.id, title: item.title, reason: item.reason, ...(item.priority ? { priority: item.priority } : {}), dueAt: iso(item.dueAt) });
  return items.sort((left, right) => attentionRank(left) - attentionRank(right) || left.title.localeCompare(right.title)).slice(0, 5);
}

export function buildUpcomingItems(now: Date, items: Array<{ entityType: DashboardUpcomingItem['entityType']; entityId: string; title: string; eventType: string; date: Date }>): DashboardUpcomingItem[] {
  const horizon = new Date(now.getTime() + DASHBOARD_HORIZON_MS);
  return items.filter((item) => item.date >= now && item.date <= horizon).sort((left, right) => left.date.getTime() - right.date.getTime()).slice(0, 5).map((item) => ({ ...item, date: item.date.toISOString(), label: item.eventType.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
}

export const DASHBOARD_HORIZON_DAYS = 30;
export const DASHBOARD_COLLECTION_LIMIT = 5;
