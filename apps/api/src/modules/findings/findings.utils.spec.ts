import { describe, expect, it } from 'vitest';

import { canTransitionFinding } from './findings.utils';

describe('Finding lifecycle invariants', () => {
  it('allows only the supported Finding transitions', () => {
    expect(canTransitionFinding('OPEN', 'IN_REMEDIATION')).toBe(true);
    expect(canTransitionFinding('IN_REMEDIATION', 'READY_FOR_VALIDATION')).toBe(true);
    expect(canTransitionFinding('READY_FOR_VALIDATION', 'IN_REMEDIATION')).toBe(true);
    expect(canTransitionFinding('READY_FOR_VALIDATION', 'CLOSED')).toBe(true);
    expect(canTransitionFinding('CLOSED', 'OPEN')).toBe(true);
    expect(canTransitionFinding('OPEN', 'CLOSED')).toBe(false);
    expect(canTransitionFinding('CLOSED', 'IN_REMEDIATION')).toBe(false);
  });
});
