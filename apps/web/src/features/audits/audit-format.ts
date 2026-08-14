import type {
  AuditStatus,
  AuditTestResult,
  AuditTestStatus,
  AuditType,
  AuditMemberRole,
} from './audit-api';

export const auditTypeLabel: Record<AuditType, string> = {
  INTERNAL: 'Internal',
  EXTERNAL: 'External',
  COMPLIANCE: 'Compliance',
  OPERATIONAL: 'Operational',
  VENDOR: 'Vendor',
};
export const auditStatusLabel: Record<AuditStatus, string> = {
  DRAFT: 'Draft',
  PLANNED: 'Planned',
  IN_PROGRESS: 'In progress',
  UNDER_REVIEW: 'Under review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
export const testStatusLabel: Record<AuditTestStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  READY_FOR_REVIEW: 'Ready for review',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
};
export const testResultLabel: Record<AuditTestResult, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  EXCEPTION: 'Exception',
  NOT_APPLICABLE: 'Not applicable',
};
export const auditMemberRoleLabel: Record<AuditMemberRole, string> = {
  LEAD_AUDITOR: 'Lead auditor',
  AUDITOR: 'Auditor',
  REVIEWER: 'Reviewer',
  OBSERVER: 'Observer',
};
export function formatAuditDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(value),
      )
    : '—';
}
export function formatAuditDateRange(start: string | null, end: string | null) {
  return `${formatAuditDate(start)} – ${formatAuditDate(end)}`;
}
export function statusTone(status: AuditStatus | AuditTestStatus) {
  return status === 'COMPLETED'
    ? 'text-success'
    : status === 'CANCELLED' || status === 'BLOCKED'
      ? 'text-danger'
      : status === 'UNDER_REVIEW' || status === 'READY_FOR_REVIEW'
        ? 'text-warning'
        : status === 'IN_PROGRESS'
          ? 'text-primary'
          : 'text-text-secondary';
}
export function resultTone(result: AuditTestResult | null) {
  return result === 'PASS'
    ? 'text-success'
    : result === 'FAIL'
      ? 'text-danger'
      : result === 'EXCEPTION'
        ? 'text-warning'
        : 'text-text-muted';
}
