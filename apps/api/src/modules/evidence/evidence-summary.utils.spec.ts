import { describe, expect, it } from 'vitest';

import { evidenceAttentionReason, evidenceSummaryWindow } from './evidence-summary.utils';

describe('evidence summary helpers', () => {
  it('prioritizes expired evidence', () => {
    expect(evidenceAttentionReason({ expiresAt: new Date('2026-08-13T00:00:00.000Z'), hasVersion: true, hasControl: true, hasExecution: true }, new Date('2026-08-14T00:00:00.000Z'))).toBe('Expired evidence');
  });

  it('creates a thirty-day expiry window', () => {
    expect(evidenceSummaryWindow(new Date('2026-08-14T00:00:00.000Z')).to).toEqual(new Date('2026-09-13T00:00:00.000Z'));
  });
});
