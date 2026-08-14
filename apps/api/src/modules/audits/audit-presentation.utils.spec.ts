import { describe, expect, it } from 'vitest';
import { summarizeAuditTests } from './audit-presentation.utils';

describe('audit presentation summaries', () => {
  it('counts completed results and pending tests from lifecycle state', () => {
    expect(
      summarizeAuditTests([
        { status: 'COMPLETED', result: 'PASS' },
        { status: 'COMPLETED', result: 'EXCEPTION' },
        { status: 'COMPLETED', result: 'FAIL' },
        { status: 'COMPLETED', result: 'NOT_APPLICABLE' },
        { status: 'IN_PROGRESS', result: null },
        { status: 'BLOCKED', result: null },
      ]),
    ).toEqual({
      total: 6,
      completed: 4,
      pass: 1,
      exception: 1,
      fail: 1,
      notApplicable: 1,
      pending: 2,
      completionPercent: 67,
    });
  });
});
