import { describe, expect, it } from 'vitest';

import { calculateRiskAssessment } from './risks.service';

describe('calculateRiskAssessment', () => {
  it('calculates score and severity on the backend', () => {
    expect(calculateRiskAssessment(4, 5)).toEqual({
      score: 20,
      severity: 'CRITICAL',
    });
  });

  it.each([
    [1, 4, 'LOW'],
    [1, 5, 'MEDIUM'],
    [2, 5, 'HIGH'],
    [4, 5, 'CRITICAL'],
  ])('maps %s x %s to %s', (likelihood, impact, severity) => {
    expect(calculateRiskAssessment(likelihood, impact).severity).toBe(severity);
  });
});
