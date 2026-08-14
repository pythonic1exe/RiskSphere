import { apiRequest } from '@/features/auth/auth-client';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'OPEN' | 'IN_REMEDIATION' | 'READY_FOR_VALIDATION' | 'CLOSED';
export type FindingSourceType = 'MANUAL' | 'AUDIT_OBSERVATION';
export type FindingEvidencePurpose = 'REMEDIATION' | 'VALIDATION';
export type FindingValidationDecision = 'ACCEPTED' | 'REJECTED';
export type FindingResolutionType =
  'REMEDIATED' | 'RISK_ACCEPTED' | 'FALSE_POSITIVE' | 'DUPLICATE' | 'OTHER';

export type FindingOwner = { id: string; name: string } | null;
export type FindingSource = {
  type: FindingSourceType;
  audit?: { id: string; code: string; title: string } | null;
  auditTest?: { id: string; code: string; title: string } | null;
  observation?: { id: string; content: string } | null;
};
export type Finding = {
  id: string;
  organizationId: string;
  findingNumber: string;
  title: string;
  description: string | null;
  severity: FindingSeverity;
  status: FindingStatus;
  sourceType: FindingSourceType;
  owner: FindingOwner;
  ownerMembershipId: string | null;
  rootCause: string | null;
  impact: string | null;
  recommendation: string | null;
  remediationPlan: string | null;
  dueDate: string | null;
  resolutionType: FindingResolutionType | null;
  resolutionRationale: string | null;
  openedAt: string;
  submittedForValidationAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  source: FindingSource;
  counts: { evidence: number; validations: number; activities: number };
  taskSummary?: {
    total: number;
    todo: number;
    inProgress: number;
    blocked: number;
    done: number;
    cancelled: number;
    completionPercentage: number | null;
  } | null;
  latestValidation: FindingValidation | null;
  isOverdue: boolean;
  daysOverdue: number;
};
export type FindingPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
export type FindingListResponse = { data: Finding[]; pagination: FindingPagination };
export type FindingSummary = {
  total: number;
  open: number;
  inRemediation: number;
  readyForValidation: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
  dueSoon: number;
};
export type FindingListParams = {
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  status?: FindingStatus | 'ALL' | undefined;
  severity?: FindingSeverity | 'ALL' | undefined;
  sourceType?: FindingSourceType | 'ALL' | undefined;
  ownerMembershipId?: string | undefined;
  overdue?: boolean | undefined;
  dueBefore?: string | undefined;
  dueAfter?: string | undefined;
  sortBy?:
    | 'findingNumber'
    | 'title'
    | 'severity'
    | 'status'
    | 'dueDate'
    | 'createdAt'
    | 'updatedAt'
    | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
};
export type CreateFindingInput = {
  title: string;
  severity: FindingSeverity;
  description?: string | undefined;
  ownerMembershipId?: string | null | undefined;
  dueDate?: string | null | undefined;
  impact?: string | null | undefined;
  recommendation?: string | null | undefined;
};
export type UpdateFindingInput = Partial<CreateFindingInput> & {
  rootCause?: string | null | undefined;
  remediationPlan?: string | null | undefined;
};
export type PromoteFindingInput = Omit<CreateFindingInput, 'description'> & {
  description?: string;
  impact?: string | null;
  recommendation?: string | null;
};
export type FindingEvidence = {
  id: string;
  organizationId: string;
  findingId: string;
  evidenceVersionId: string;
  purpose: FindingEvidencePurpose;
  createdAt: string;
  evidenceVersion: {
    id: string;
    versionNumber: number;
    fileName: string | null;
    externalUrl: string | null;
    createdAt: string;
    evidence: { id: string; title: string; type: string };
  };
};
export type FindingValidation = {
  id: string;
  decision: FindingValidationDecision;
  notes: string | null;
  resolutionType: FindingResolutionType | null;
  resolutionRationale: string | null;
  createdAt: string;
  reviewerMembership?: { id: string; user?: { email: string } | null } | null;
};
export type FindingActivity = {
  id: string;
  type: string;
  fromStatus: FindingStatus | null;
  toStatus: FindingStatus | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actorMembership?: { id: string; user?: { email: string } | null } | null;
};

function queryString(params: FindingListParams) {
  const query = new globalThis.URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'ALL') query.set(key, String(value));
  });
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 10));
  return query.toString();
}

export function getFindings(organizationId: string, params: FindingListParams = {}) {
  return apiRequest<FindingListResponse>(
    `/organizations/${organizationId}/findings?${queryString(params)}`,
  );
}
export function getFindingSummary(organizationId: string) {
  return apiRequest<FindingSummary>(`/organizations/${organizationId}/findings/summary`);
}
export function getFinding(organizationId: string, findingId: string) {
  return apiRequest<Finding>(`/organizations/${organizationId}/findings/${findingId}`);
}
export function createFinding(organizationId: string, body: CreateFindingInput) {
  return apiRequest<Finding>(`/organizations/${organizationId}/findings`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function updateFinding(organizationId: string, findingId: string, body: UpdateFindingInput) {
  return apiRequest<Finding>(`/organizations/${organizationId}/findings/${findingId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
export function promoteObservationToFinding(
  organizationId: string,
  auditTestId: string,
  observationId: string,
  body: PromoteFindingInput,
) {
  return apiRequest<Finding>(
    `/organizations/${organizationId}/audit-tests/${auditTestId}/observations/${observationId}/promote-to-finding`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
export function startFindingRemediation(organizationId: string, findingId: string) {
  return apiRequest<Finding>(
    `/organizations/${organizationId}/findings/${findingId}/start-remediation`,
    { method: 'POST' },
  );
}
export function submitFindingForValidation(organizationId: string, findingId: string) {
  return apiRequest<Finding>(
    `/organizations/${organizationId}/findings/${findingId}/submit-for-validation`,
    { method: 'POST' },
  );
}
export function reopenFinding(organizationId: string, findingId: string, rationale: string) {
  return apiRequest<Finding>(`/organizations/${organizationId}/findings/${findingId}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ rationale }),
  });
}
export function closeFindingExceptionally(
  organizationId: string,
  findingId: string,
  body: {
    resolutionType: Exclude<FindingResolutionType, 'REMEDIATED'>;
    resolutionRationale: string;
  },
) {
  return apiRequest<Finding>(
    `/organizations/${organizationId}/findings/${findingId}/close-exceptionally`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
export function getFindingEvidence(organizationId: string, findingId: string) {
  return apiRequest<{ data: FindingEvidence[] }>(
    `/organizations/${organizationId}/findings/${findingId}/evidence`,
  );
}
export function linkFindingEvidence(
  organizationId: string,
  findingId: string,
  evidenceVersionId: string,
  purpose: FindingEvidencePurpose,
) {
  return apiRequest<FindingEvidence>(
    `/organizations/${organizationId}/findings/${findingId}/evidence`,
    { method: 'POST', body: JSON.stringify({ evidenceVersionId, purpose }) },
  );
}
export function unlinkFindingEvidence(
  organizationId: string,
  findingId: string,
  findingEvidenceId: string,
) {
  return apiRequest<{ deleted: boolean }>(
    `/organizations/${organizationId}/findings/${findingId}/evidence/${findingEvidenceId}`,
    { method: 'DELETE' },
  );
}
export function getFindingValidations(organizationId: string, findingId: string) {
  return apiRequest<{ data: FindingValidation[] }>(
    `/organizations/${organizationId}/findings/${findingId}/validations`,
  );
}
export function validateFinding(
  organizationId: string,
  findingId: string,
  body: {
    decision: FindingValidationDecision;
    notes?: string;
    resolutionType?: FindingResolutionType;
    resolutionRationale?: string;
  },
) {
  return apiRequest<{ validation: FindingValidation; finding: Finding }>(
    `/organizations/${organizationId}/findings/${findingId}/validations`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
export function getFindingActivity(organizationId: string, findingId: string) {
  return apiRequest<{ data: FindingActivity[] }>(
    `/organizations/${organizationId}/findings/${findingId}/activity`,
  );
}
