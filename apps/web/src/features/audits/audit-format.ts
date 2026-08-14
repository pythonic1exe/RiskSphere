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
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
export const testStatusLabel: Record<AuditTestStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  READY_FOR_REVIEW: 'Ready for Review',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
};
export const testResultLabel: Record<AuditTestResult, string> = {
  PASS: 'Pass',
  FAIL: 'Fail',
  EXCEPTION: 'Exception',
  NOT_APPLICABLE: 'Not Applicable',
};
export const auditMemberRoleLabel: Record<AuditMemberRole, string> = {
  LEAD_AUDITOR: 'Lead Auditor',
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
export function humanizePerson(name: string | null | undefined, email?: string | null) {
  const value = (name || email || '').trim();
  if (!value) return 'Unassigned';
  if (!value.includes('@')) return value;
  const local = (value.split('@')[0] ?? '').replace(/[._-]+/g, ' ').trim();
  return local
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
export function personEmail(name: string | null | undefined, email?: string | null) {
  const value = (email || name || '').trim();
  return value.includes('@') ? value : null;
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
