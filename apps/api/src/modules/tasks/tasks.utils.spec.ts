import { describe, expect, it } from 'vitest';

import { canTransitionTask, taskCompletionSummary, taskOverdueState } from './tasks.utils';

describe('Task workflow utilities', () => {
  it('allows only the supported Task lifecycle transitions', () => {
    expect(canTransitionTask('TODO', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionTask('TODO', 'BLOCKED')).toBe(true);
    expect(canTransitionTask('IN_PROGRESS', 'DONE')).toBe(true);
    expect(canTransitionTask('BLOCKED', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionTask('DONE', 'TODO')).toBe(true);
    expect(canTransitionTask('TODO', 'DONE')).toBe(false);
    expect(canTransitionTask('CANCELLED', 'TODO')).toBe(false);
  });

  it('derives overdue state without treating completed or cancelled Tasks as overdue', () => {
    const now = new Date('2026-08-15T00:00:00.000Z');
    expect(taskOverdueState({ status: 'IN_PROGRESS', dueDate: new Date('2026-08-11T00:00:00.000Z') }, now)).toEqual({ isOverdue: true, daysOverdue: 4 });
    expect(taskOverdueState({ status: 'DONE', dueDate: new Date('2026-08-11T00:00:00.000Z') }, now)).toEqual({ isOverdue: false, daysOverdue: 0 });
  });

  it('excludes cancelled Tasks from completion progress', () => {
    expect(taskCompletionSummary([{ status: 'DONE' }, { status: 'CANCELLED' }, { status: 'IN_PROGRESS' }])).toEqual({ total: 2, todo: 0, inProgress: 1, blocked: 0, done: 1, cancelled: 1, completionPercentage: 50 });
    expect(taskCompletionSummary([]).completionPercentage).toBeNull();
  });
});
