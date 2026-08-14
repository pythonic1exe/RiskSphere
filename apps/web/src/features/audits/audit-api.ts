import { apiRequest } from '@/features/auth/auth-client';

export type AuditType = 'INTERNAL' | 'EXTERNAL' | 'COMPLIANCE' | 'OPERATIONAL' | 'VENDOR';
export type AuditStatus =
  'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
export type AuditMemberRole = 'LEAD_AUDITOR' | 'AUDITOR' | 'REVIEWER' | 'OBSERVER';
export type AuditScopeType = 'FRAMEWORK' | 'REQUIREMENT' | 'CONTROL';
export type AuditTestStatus =
  'NOT_STARTED' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'COMPLETED' | 'BLOCKED';
export type AuditTestResult = 'PASS' | 'FAIL' | 'EXCEPTION' | 'NOT_APPLICABLE';
export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
export type MemberRole = { id: string; code: string; name: string };
export type OrganizationMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  roles: MemberRole[];
};
export type MemberSummary = { id: string; name: string };

export type AuditTestSummary = {
  total: number;
  completed: number;
  pass: number;
  exception: number;
  fail: number;
  notApplicable: number;
  pending: number;
  completionPercent: number;
};
export type AuditTest = {
  id: string;
  organizationId: string;
  auditId: string;
  code: string;
  title: string;
  description: string | null;
  controlId: string | null;
  organizationRequirementId: string | null;
  control?: { id: string; code: string; title: string } | null;
  organizationRequirement?: { id: string; code: string; title: string } | null;
  procedure: string;
  expectedResult: string;
  status: AuditTestStatus;
  result: AuditTestResult | null;
  assignedTo: MemberSummary | null;
  assignedToMembershipId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  evidenceCount?: number;
  observationCount?: number;
  createdAt: string;
  updatedAt: string;
};
export type AuditScope = {
  id: string;
  type: AuditScopeType;
  organizationFrameworkId: string | null;
  organizationRequirementId: string | null;
  controlId: string | null;
  framework?: { id: string; code: string; name: string; version: string } | null;
  requirement?: { id: string; code: string; title: string } | null;
  control?: { id: string; code: string; title: string } | null;
  createdAt: string;
};
export type AuditMember = {
  id: string;
  membershipId: string;
  role: AuditMemberRole;
  addedAt: string;
  member: MemberSummary | null;
};
export type Audit = {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  description: string | null;
  type: AuditType;
  status: AuditStatus;
  leadAuditor: MemberSummary | null;
  leadAuditorMembershipId: string | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  counts: { members: number; scopes: number; tests: number };
  testSummary: AuditTestSummary;
  members?: AuditMember[];
  scopes?: AuditScope[];
  tests?: AuditTest[];
};
export type AuditListResponse = { data: Audit[]; pagination: Pagination };
export type AuditListParams = {
  search?: string;
  status?: AuditStatus;
  type?: AuditType;
  leadAuditorMembershipId?: string;
  memberMembershipId?: string;
  plannedStartBefore?: string;
  plannedEndAfter?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'code' | 'title' | 'plannedStartAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
};
export type AuditTestListResponse = { data: AuditTest[]; pagination: Pagination };
export type AuditTestListParams = {
  search?: string;
  status?: AuditTestStatus;
  result?: AuditTestResult;
  assignedToMembershipId?: string;
  controlId?: string;
  organizationRequirementId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'code' | 'title' | 'status' | 'result' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};
export type AuditTestEvidenceLink = {
  id: string;
  evidenceId: string;
  evidenceVersionId: string;
  linkedAt: string;
  evidence: { id: string; title: string; type: string };
  evidenceVersion: {
    id: string;
    versionNumber: number;
    fileName: string | null;
    externalUrl: string | null;
    createdAt: string;
    uploadedByMembershipId: string;
  };
};
export type AuditObservation = {
  id: string;
  auditTestId: string;
  content: string;
  createdByMembershipId: string;
  updatedByMembershipId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: MemberSummary | null;
};

function queryString(params: Record<string, string | number | undefined>) {
  const query = new globalThis.URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return query.toString();
}
function normalizeAudit(audit: Audit): Audit {
  const tests = audit.tests ?? [];
  const completed = tests.filter((test) => test.status === 'COMPLETED').length;
  const pass = tests.filter((test) => test.result === 'PASS').length;
  const exception = tests.filter((test) => test.result === 'EXCEPTION').length;
  const fail = tests.filter((test) => test.result === 'FAIL').length;
  const notApplicable = tests.filter((test) => test.result === 'NOT_APPLICABLE').length;
  const total = audit.testSummary?.total ?? audit.counts?.tests ?? tests.length;
  const resolvedSummary = audit.testSummary ?? {
    total,
    completed,
    pass,
    exception,
    fail,
    notApplicable,
    pending: Math.max(total - completed, 0),
    completionPercent: total ? Math.round((completed / total) * 100) : 0,
  };
  return {
    ...audit,
    counts: {
      members: audit.counts?.members ?? audit.members?.length ?? 0,
      scopes: audit.counts?.scopes ?? audit.scopes?.length ?? 0,
      tests: audit.counts?.tests ?? total,
    },
    testSummary: resolvedSummary,
  };
}
export function getOrganizationMembers(organizationId: string) {
  return apiRequest<{ data: OrganizationMember[] }>(`/organizations/${organizationId}/members`);
}
export function getAudits(organizationId: string, params: AuditListParams = {}) {
  return apiRequest<AuditListResponse>(
    `/organizations/${organizationId}/audits?${queryString({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 10 })}`,
  ).then((response) => ({ ...response, data: response.data.map(normalizeAudit) }));
}
export function getAudit(organizationId: string, auditId: string) {
  return apiRequest<Audit>(`/organizations/${organizationId}/audits/${auditId}`).then(
    normalizeAudit,
  );
}
export function createAudit(
  organizationId: string,
  body: {
    code: string;
    title: string;
    type: AuditType;
    description?: string;
    leadAuditorMembershipId?: string;
    plannedStartAt?: string;
    plannedEndAt?: string;
  },
) {
  return apiRequest<Audit>(`/organizations/${organizationId}/audits`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function updateAudit(
  organizationId: string,
  auditId: string,
  body: Partial<Parameters<typeof createAudit>[1]>,
) {
  return apiRequest<Audit>(`/organizations/${organizationId}/audits/${auditId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
function auditLifecycle(
  organizationId: string,
  auditId: string,
  action: 'plan' | 'start' | 'submit-for-review' | 'complete' | 'cancel',
) {
  return apiRequest<Audit>(`/organizations/${organizationId}/audits/${auditId}/${action}`, {
    method: 'POST',
  });
}
export const planAudit = (organizationId: string, auditId: string) =>
  auditLifecycle(organizationId, auditId, 'plan');
export const startAudit = (organizationId: string, auditId: string) =>
  auditLifecycle(organizationId, auditId, 'start');
export const submitAuditForReview = (organizationId: string, auditId: string) =>
  auditLifecycle(organizationId, auditId, 'submit-for-review');
export const completeAudit = (organizationId: string, auditId: string) =>
  auditLifecycle(organizationId, auditId, 'complete');
export const cancelAudit = (organizationId: string, auditId: string) =>
  auditLifecycle(organizationId, auditId, 'cancel');
export function getAuditMembers(organizationId: string, auditId: string) {
  return apiRequest<{ data: AuditMember[] }>(
    `/organizations/${organizationId}/audits/${auditId}/members`,
  );
}
export function addAuditMember(
  organizationId: string,
  auditId: string,
  body: { membershipId: string; role: AuditMemberRole },
) {
  return apiRequest<AuditMember>(`/organizations/${organizationId}/audits/${auditId}/members`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function updateAuditMember(
  organizationId: string,
  auditId: string,
  memberId: string,
  role: AuditMemberRole,
) {
  return apiRequest<AuditMember>(
    `/organizations/${organizationId}/audits/${auditId}/members/${memberId}`,
    { method: 'PATCH', body: JSON.stringify({ role }) },
  );
}
export function removeAuditMember(organizationId: string, auditId: string, memberId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/organizations/${organizationId}/audits/${auditId}/members/${memberId}`,
    { method: 'DELETE' },
  );
}
export function getAuditScope(organizationId: string, auditId: string) {
  return apiRequest<{ data: AuditScope[] }>(
    `/organizations/${organizationId}/audits/${auditId}/scope`,
  );
}
export function addAuditScope(
  organizationId: string,
  auditId: string,
  body: {
    type: AuditScopeType;
    organizationFrameworkId?: string;
    organizationRequirementId?: string;
    controlId?: string;
  },
) {
  return apiRequest<AuditScope>(`/organizations/${organizationId}/audits/${auditId}/scope`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function removeAuditScope(organizationId: string, auditId: string, scopeId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/organizations/${organizationId}/audits/${auditId}/scope/${scopeId}`,
    { method: 'DELETE' },
  );
}
export function getAuditTests(
  organizationId: string,
  auditId: string,
  params: AuditTestListParams = {},
) {
  return apiRequest<AuditTestListResponse>(
    `/organizations/${organizationId}/audits/${auditId}/tests?${queryString({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 10 })}`,
  );
}
export function getAuditTest(organizationId: string, testId: string) {
  return apiRequest<AuditTest>(`/organizations/${organizationId}/audit-tests/${testId}`);
}
export function createAuditTest(
  organizationId: string,
  auditId: string,
  body: {
    code: string;
    title: string;
    description?: string;
    controlId?: string;
    organizationRequirementId?: string;
    procedure: string;
    expectedResult: string;
    assignedToMembershipId?: string;
    notes?: string;
  },
) {
  return apiRequest<AuditTest>(`/organizations/${organizationId}/audits/${auditId}/tests`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function updateAuditTest(
  organizationId: string,
  testId: string,
  body: Partial<Parameters<typeof createAuditTest>[2]>,
) {
  return apiRequest<AuditTest>(`/organizations/${organizationId}/audit-tests/${testId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
function testLifecycle(
  organizationId: string,
  testId: string,
  action: 'start' | 'submit-for-review' | 'block' | 'unblock',
) {
  return apiRequest<AuditTest>(`/organizations/${organizationId}/audit-tests/${testId}/${action}`, {
    method: 'POST',
  });
}
export const startAuditTest = (organizationId: string, testId: string) =>
  testLifecycle(organizationId, testId, 'start');
export const submitAuditTestForReview = (organizationId: string, testId: string) =>
  testLifecycle(organizationId, testId, 'submit-for-review');
export const blockAuditTest = (organizationId: string, testId: string) =>
  testLifecycle(organizationId, testId, 'block');
export const unblockAuditTest = (organizationId: string, testId: string) =>
  testLifecycle(organizationId, testId, 'unblock');
export function completeAuditTest(organizationId: string, testId: string, result: AuditTestResult) {
  return apiRequest<AuditTest>(`/organizations/${organizationId}/audit-tests/${testId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ result }),
  });
}
export function getAuditTestEvidence(organizationId: string, testId: string) {
  return apiRequest<{ auditTestId: string; data: AuditTestEvidenceLink[] }>(
    `/organizations/${organizationId}/audit-tests/${testId}/evidence`,
  );
}
export function linkAuditTestEvidence(
  organizationId: string,
  testId: string,
  body: { evidenceId: string; evidenceVersionId: string },
) {
  return apiRequest<AuditTestEvidenceLink>(
    `/organizations/${organizationId}/audit-tests/${testId}/evidence`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}
export function unlinkAuditTestEvidence(organizationId: string, testId: string, linkId: string) {
  return apiRequest<{ deleted: boolean }>(
    `/organizations/${organizationId}/audit-tests/${testId}/evidence/${linkId}`,
    { method: 'DELETE' },
  );
}
export function getAuditTestObservations(organizationId: string, testId: string) {
  return apiRequest<{ data: AuditObservation[] }>(
    `/organizations/${organizationId}/audit-tests/${testId}/observations`,
  );
}
export function createAuditTestObservation(
  organizationId: string,
  testId: string,
  content: string,
) {
  return apiRequest<AuditObservation>(
    `/organizations/${organizationId}/audit-tests/${testId}/observations`,
    { method: 'POST', body: JSON.stringify({ content }) },
  );
}
export function updateAuditTestObservation(
  organizationId: string,
  testId: string,
  observationId: string,
  content: string,
) {
  return apiRequest<AuditObservation>(
    `/organizations/${organizationId}/audit-tests/${testId}/observations/${observationId}`,
    { method: 'PATCH', body: JSON.stringify({ content }) },
  );
}
export function removeAuditTestObservation(
  organizationId: string,
  testId: string,
  observationId: string,
) {
  return apiRequest<{ deleted: boolean }>(
    `/organizations/${organizationId}/audit-tests/${testId}/observations/${observationId}`,
    { method: 'DELETE' },
  );
}
