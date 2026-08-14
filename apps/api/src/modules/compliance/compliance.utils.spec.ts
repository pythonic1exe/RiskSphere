import { describe, expect, it } from 'vitest';

import { calculateComplianceSummary, hasControlsFilter, validateAssessmentRationale } from './compliance.utils';

describe('Compliance utilities', () => {
  it('calculates derived summary percentages without partial-compliance credit', () => {
    const summary = calculateComplianceSummary([
      'COMPLIANT',
      'COMPLIANT',
      'PARTIALLY_COMPLIANT',
      'NON_COMPLIANT',
      'NOT_ASSESSED',
      'NOT_APPLICABLE',
    ]);

    expect(summary).toEqual({
      totalRequirements: 6,
      compliant: 2,
      partiallyCompliant: 1,
      nonCompliant: 1,
      inProgress: 0,
      notAssessed: 1,
      notApplicable: 1,
      compliancePercent: 40,
      assessmentCoveragePercent: 83.3,
    });
  });

  it('returns zero compliance when every requirement is not applicable', () => {
    expect(calculateComplianceSummary(['NOT_APPLICABLE'])).toMatchObject({
      compliancePercent: 0,
      assessmentCoveragePercent: 100,
    });
  });

  it('requires a meaningful rationale for NOT_APPLICABLE assessments', () => {
    expect(() => validateAssessmentRationale('NOT_APPLICABLE', '   ')).toThrow(
      'A rationale is required when a requirement is not applicable',
    );
    expect(() => validateAssessmentRationale('NOT_APPLICABLE', 'Not in scope')).not.toThrow();
    expect(() => validateAssessmentRationale('COMPLIANT', undefined)).not.toThrow();
  });

  it('parses hasControls query values without treating false as true', () => {
    expect(hasControlsFilter('true')).toEqual({ some: {} });
    expect(hasControlsFilter('false')).toEqual({ none: {} });
    expect(hasControlsFilter(undefined)).toBeUndefined();
  });
});
