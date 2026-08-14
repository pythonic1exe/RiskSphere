import { describe, expect, it } from 'vitest';

import { controlAttentionReason, controlSummaryWindow } from './controls-summary.utils';

describe('control summary helpers', () => {
  it('prioritizes overdue executions', () => {
    expect(controlAttentionReason({ dueAt: new Date('2026-08-13T00:00:00.000Z'), status: 'SCHEDULED' }, new Date('2026-08-14T00:00:00.000Z'))).toBe('Overdue execution');
  });

  it('creates a fourteen-day operations window', () => {
    expect(controlSummaryWindow(new Date('2026-08-14T00:00:00.000Z')).to).toEqual(new Date('2026-08-28T00:00:00.000Z'));
  });
});
