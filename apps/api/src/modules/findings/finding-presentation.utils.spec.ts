import { describe, expect, it } from 'vitest';

import { findingOverdueState, findingSummaryWindow } from './finding-presentation.utils';

describe('Finding presentation helpers', () => {
  it('calculates overdue days from a deterministic clock', () => {
    expect(
      findingOverdueState(
        { status: 'IN_REMEDIATION', dueDate: new Date('2026-08-10T00:00:00.000Z') },
        new Date('2026-08-14T12:00:00.000Z'),
      ),
    ).toEqual({ isOverdue: true, daysOverdue: 4 });
  });

  it('does not mark closed findings overdue and provides a seven-day window', () => {
    expect(
      findingOverdueState(
        { status: 'CLOSED', dueDate: new Date('2026-08-10T00:00:00.000Z') },
        new Date('2026-08-14T00:00:00.000Z'),
      ),
    ).toEqual({ isOverdue: false, daysOverdue: 0 });
    expect(findingSummaryWindow(new Date('2026-08-14T00:00:00.000Z'))).toEqual({
      dueSoonFrom: new Date('2026-08-14T00:00:00.000Z'),
      dueSoonTo: new Date('2026-08-21T00:00:00.000Z'),
    });
  });
});
