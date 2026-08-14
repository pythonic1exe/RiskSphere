import type { Finding, FindingActivity, FindingSeverity, FindingStatus } from './finding-api';

export const humanizeFinding = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/(^| )\w/g, (letter) => letter.toUpperCase());
export const severityLabel = (value: FindingSeverity) => humanizeFinding(value);
export const statusLabel = (value: FindingStatus) => humanizeFinding(value);
export function formatFindingDate(value: string | null) { return value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : 'No due date'; }
export function sourceLabel(finding: Finding) { return finding.sourceType === 'MANUAL' ? 'Manual' : finding.source.audit?.code ?? 'Audit'; }
export function activityLabel(activity: FindingActivity) {
  const names: Record<string, string> = { CREATED: 'Finding created', PROMOTED_FROM_OBSERVATION: 'Promoted from Audit Observation', UPDATED: 'Finding details updated', OWNER_CHANGED: 'Owner changed', SEVERITY_CHANGED: 'Severity changed', REMEDIATION_UPDATED: 'Remediation plan updated', REMEDIATION_STARTED: 'Remediation started', SUBMITTED_FOR_VALIDATION: 'Submitted for validation', EVIDENCE_LINKED: 'Evidence linked', EVIDENCE_UNLINKED: 'Evidence unlinked', VALIDATION_ACCEPTED: 'Remediation accepted', VALIDATION_REJECTED: 'Remediation rejected', CLOSED: 'Finding closed', REOPENED: 'Finding reopened' };
  return names[activity.type] ?? humanizeFinding(activity.type);
}
