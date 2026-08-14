import { describe, expect, it } from 'vitest';

import { riskAttentionReason, riskSummaryWindow } from './risks-summary.utils';

describe('risk summary helpers', () => {
  it('classifies high risks without treatment before review urgency', () => {
    expect(riskAttentionReason({ severity: 'HIGH', hasTreatment: false, nextReviewAt: null }, new Date('2026-08-14T00:00:00.000Z'))).toBe('High risk without treatment');
  });

  it('creates a thirty-day review window from the supplied clock', () => {
    expect(riskSummaryWindow(new Date('2026-08-14T00:00:00.000Z'))).toEqual({
      from: new Date('2026-08-14T00:00:00.000Z'),
      to: new Date('2026-09-13T00:00:00.000Z'),
    });
  });
});
