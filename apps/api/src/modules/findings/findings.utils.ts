import type { FindingStatus } from '@prisma/client';

export function canTransitionFinding(current: FindingStatus, next: FindingStatus): boolean {
  const transitions: Record<FindingStatus, FindingStatus[]> = {
    OPEN: ['IN_REMEDIATION'],
    IN_REMEDIATION: ['READY_FOR_VALIDATION'],
    READY_FOR_VALIDATION: ['IN_REMEDIATION', 'CLOSED'],
    CLOSED: ['OPEN'],
  };
  return transitions[current].includes(next);
}

export function findingNumber(year: number, sequence: number): string {
  return `FND-${year}-${String(sequence).padStart(4, '0')}`;
}
