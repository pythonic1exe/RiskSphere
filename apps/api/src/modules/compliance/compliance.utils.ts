import { BadRequestException } from '@nestjs/common';

export type ComplianceStatus =
  | 'NOT_ASSESSED'
  | 'IN_PROGRESS'
  | 'COMPLIANT'
  | 'PARTIALLY_COMPLIANT'
  | 'NON_COMPLIANT'
  | 'NOT_APPLICABLE';

export interface ComplianceSummary {
  totalRequirements: number;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  inProgress: number;
  notAssessed: number;
  notApplicable: number;
  compliancePercent: number;
  assessmentCoveragePercent: number;
}

export function hasControlsFilter(value: 'true' | 'false' | undefined) {
  if (value === 'true') return { some: {} } as const;
  if (value === 'false') return { none: {} } as const;
  return undefined;
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function calculateComplianceSummary(statuses: readonly ComplianceStatus[]): ComplianceSummary {
  const counts = statuses.reduce<Record<ComplianceStatus, number>>(
    (result, status) => {
      result[status] += 1;
      return result;
    },
    {
      NOT_ASSESSED: 0,
      IN_PROGRESS: 0,
      COMPLIANT: 0,
      PARTIALLY_COMPLIANT: 0,
      NON_COMPLIANT: 0,
      NOT_APPLICABLE: 0,
    },
  );

  const totalRequirements = statuses.length;
  const applicableRequirements = totalRequirements - counts.NOT_APPLICABLE;
  const assessedRequirements = totalRequirements - counts.NOT_ASSESSED;

  return {
    totalRequirements,
    compliant: counts.COMPLIANT,
    partiallyCompliant: counts.PARTIALLY_COMPLIANT,
    nonCompliant: counts.NON_COMPLIANT,
    inProgress: counts.IN_PROGRESS,
    notAssessed: counts.NOT_ASSESSED,
    notApplicable: counts.NOT_APPLICABLE,
    compliancePercent: percentage(counts.COMPLIANT, applicableRequirements),
    assessmentCoveragePercent: percentage(assessedRequirements, totalRequirements),
  };
}

export function validateAssessmentRationale(status: ComplianceStatus, rationale?: string): void {
  if (status === 'NOT_APPLICABLE' && !rationale?.trim()) {
    throw new BadRequestException('A rationale is required when a requirement is not applicable');
  }
}
