import { describe, expect, it } from 'vitest';

import { buildDashboardAttention, buildUpcomingItems } from './dashboard-presentation.utils';

describe('dashboard presentation utilities', () => {
  it('ranks critical overdue items before lower-priority attention', () => {
    const items = buildDashboardAttention({
      risks: [{ id: 'risk-1', title: 'Risk', reason: 'Review overdue', severity: 'HIGH', dueAt: '2026-08-10T00:00:00.000Z' }],
      findings: [{ id: 'finding-1', title: 'Finding', reason: 'Overdue', severity: 'CRITICAL', dueAt: '2026-08-12T00:00:00.000Z' }],
      tasks: [{ id: 'task-1', title: 'Task', reason: 'Due soon', priority: 'HIGH', dueAt: '2026-08-18T00:00:00.000Z' }],
    });

    expect(items.map((item) => item.entityId)).toEqual(['finding-1', 'risk-1', 'task-1']);
    expect(items).toHaveLength(3);
  });

  it('returns future upcoming items chronologically within the dashboard horizon', () => {
    const now = new Date('2026-08-15T00:00:00.000Z');
    const items = buildUpcomingItems(now, [
      { entityType: 'RISK', entityId: 'risk-1', title: 'Risk review', eventType: 'REVIEW', date: new Date('2026-08-20T00:00:00.000Z') },
      { entityType: 'TASK', entityId: 'task-1', title: 'Task due', eventType: 'DUE_DATE', date: new Date('2026-09-20T00:00:00.000Z') },
      { entityType: 'AUDIT', entityId: 'audit-1', title: 'Audit start', eventType: 'START_DATE', date: new Date('2026-08-18T00:00:00.000Z') },
      { entityType: 'EVIDENCE', entityId: 'evidence-1', title: 'Expired evidence', eventType: 'EXPIRATION', date: new Date('2026-08-14T00:00:00.000Z') },
    ]);

    expect(items.map((item) => item.entityId)).toEqual(['audit-1', 'risk-1']);
  });
});
