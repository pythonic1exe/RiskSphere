import { describe, expect, it } from 'vitest';

import { canTransitionControlExecution, nextControlCode, isExecutionOverdue } from './controls.utils';

describe('Controls invariants', () => {
  it('generates the next organization control code', () => {
    expect(nextControlCode(['CTRL-001', 'CTRL-009', 'CTRL-foo'])).toBe('CTRL-010');
  });

  it('allows only supported execution transitions', () => {
    expect(canTransitionControlExecution('SCHEDULED', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionControlExecution('SCHEDULED', 'COMPLETED')).toBe(true);
    expect(canTransitionControlExecution('COMPLETED', 'IN_PROGRESS')).toBe(false);
  });

  it('derives overdue only for unfinished executions', () => {
    const past = new Date('2026-01-01T00:00:00.000Z');
    expect(isExecutionOverdue(past, 'SCHEDULED', new Date('2026-02-01T00:00:00.000Z'))).toBe(true);
    expect(isExecutionOverdue(past, 'COMPLETED', new Date('2026-02-01T00:00:00.000Z'))).toBe(false);
  });
});
