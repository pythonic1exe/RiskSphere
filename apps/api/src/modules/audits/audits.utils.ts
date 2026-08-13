import type { AuditScopeType, AuditStatus, AuditTestStatus } from '@prisma/client';

export function canTransitionAudit(current: AuditStatus, next: AuditStatus): boolean {
  const transitions: Record<AuditStatus, AuditStatus[]> = {
    DRAFT: ['PLANNED', 'CANCELLED'],
    PLANNED: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['UNDER_REVIEW', 'CANCELLED'],
    UNDER_REVIEW: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };
  return transitions[current].includes(next);
}

export function canTransitionAuditTest(current: AuditTestStatus, next: AuditTestStatus): boolean {
  const transitions: Record<AuditTestStatus, AuditTestStatus[]> = {
    NOT_STARTED: ['IN_PROGRESS', 'BLOCKED'],
    IN_PROGRESS: ['READY_FOR_REVIEW', 'BLOCKED'],
    READY_FOR_REVIEW: ['COMPLETED', 'BLOCKED'],
    COMPLETED: [],
    BLOCKED: ['IN_PROGRESS'],
  };
  return transitions[current].includes(next);
}

export function hasMeaningfulAuditScope(scopeCount: number): boolean {
  return scopeCount > 0;
}

export function validateAuditScopeTarget(
  type: AuditScopeType,
  targets: { organizationFrameworkId?: string; organizationRequirementId?: string; controlId?: string },
): boolean {
  return type === 'FRAMEWORK'
    ? Boolean(targets.organizationFrameworkId) && !targets.organizationRequirementId && !targets.controlId
    : type === 'REQUIREMENT'
      ? Boolean(targets.organizationRequirementId) && !targets.organizationFrameworkId && !targets.controlId
      : Boolean(targets.controlId) && !targets.organizationFrameworkId && !targets.organizationRequirementId;
}
