import type { taskCompletionSummary } from '../tasks/tasks.utils';

const DAY_MS = 24 * 60 * 60 * 1000;

export function findingSummaryWindow(now: Date) {
  return { dueSoonFrom: now, dueSoonTo: new Date(now.getTime() + 7 * DAY_MS) };
}

export function findingOverdueState(
  finding: { status: string; dueDate: Date | null },
  now: Date,
) {
  if (finding.status === 'CLOSED' || !finding.dueDate || finding.dueDate >= now) {
    return { isOverdue: false, daysOverdue: 0 };
  }
  return {
    isOverdue: true,
    daysOverdue: Math.floor((now.getTime() - finding.dueDate.getTime()) / DAY_MS),
  };
}

function memberSummary(member: any) {
  return member ? { id: member.id, name: member.user?.email ?? member.id } : null;
}

export function mapFinding(finding: any, now = new Date(), taskSummary?: ReturnType<typeof taskCompletionSummary>) {
  const overdue = findingOverdueState(finding, now);
  const sourceObservation = finding.sourceObservation;
  const sourceTest = sourceObservation?.auditTest;
  const sourceAudit = sourceTest?.audit;
  return {
    id: finding.id,
    organizationId: finding.organizationId,
    findingNumber: finding.findingNumber,
    title: finding.title,
    description: finding.description,
    severity: finding.severity,
    status: finding.status,
    sourceType: finding.sourceType,
    owner: memberSummary(finding.ownerMembership),
    ownerMembershipId: finding.ownerMembershipId,
    rootCause: finding.rootCause,
    impact: finding.impact,
    recommendation: finding.recommendation,
    remediationPlan: finding.remediationPlan,
    dueDate: finding.dueDate,
    resolutionType: finding.resolutionType,
    resolutionRationale: finding.resolutionRationale,
    openedAt: finding.openedAt,
    submittedForValidationAt: finding.submittedForValidationAt,
    closedAt: finding.closedAt,
    createdByMembershipId: finding.createdByMembershipId,
    updatedByMembershipId: finding.updatedByMembershipId,
    createdAt: finding.createdAt,
    updatedAt: finding.updatedAt,
    source: finding.sourceType === 'AUDIT_OBSERVATION'
      ? {
          type: finding.sourceType,
          observation: sourceObservation ? { id: sourceObservation.id, content: sourceObservation.content } : null,
          auditTest: sourceTest ? { id: sourceTest.id, code: sourceTest.code, title: sourceTest.title } : null,
          audit: sourceAudit ? { id: sourceAudit.id, code: sourceAudit.code, title: sourceAudit.title } : null,
        }
      : { type: finding.sourceType },
    counts: {
      evidence: finding._count?.evidence ?? finding.evidence?.length ?? 0,
      validations: finding._count?.validations ?? finding.validations?.length ?? 0,
      activities: finding._count?.activities ?? finding.activities?.length ?? 0,
    },
    latestValidation: finding.validations?.[0] ?? null,
    taskSummary: taskSummary ?? null,
    ...overdue,
  };
}

export function mapFindingSummary(findings: Array<{ status: string; severity: string; dueDate: Date | null }>, now = new Date()) {
  const { dueSoonFrom, dueSoonTo } = findingSummaryWindow(now);
  const active = findings.filter((finding) => finding.status !== 'CLOSED');
  const count = (value: string) => findings.filter((finding) => finding.status === value).length;
  const severity = (value: string) => findings.filter((finding) => finding.severity === value).length;
  return {
    total: findings.length,
    open: count('OPEN'),
    inRemediation: count('IN_REMEDIATION'),
    readyForValidation: count('READY_FOR_VALIDATION'),
    closed: count('CLOSED'),
    critical: severity('CRITICAL'),
    high: severity('HIGH'),
    medium: severity('MEDIUM'),
    low: severity('LOW'),
    overdue: active.filter((finding) => finding.dueDate && finding.dueDate < now).length,
    dueSoon: active.filter((finding) => finding.dueDate && finding.dueDate >= dueSoonFrom && finding.dueDate <= dueSoonTo).length,
  };
}
