import { apiRequest } from "@/features/auth/auth-client"

export type EvidenceType = "FILE" | "URL" | "TEXT" | "SYSTEM_RECORD"
export type EvidenceStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "ARCHIVED"
export type EvidenceOwner = { id: string; name: string } | null
export type EvidenceControl = { id: string; code: string; title: string; status: string; category?: string | null; type?: string; frequency?: string }
export type EvidenceExecution = { id: string; controlId: string; periodLabel: string; periodStart: string; periodEnd: string; dueAt: string; status: string; assignedToMembershipId?: string | null; completedAt?: string | null }

export type EvidenceVersion = {
  id: string
  evidenceId: string
  versionNumber: number
  fileName: string | null
  storageKey: string | null
  mimeType: string | null
  fileSize: number | null
  checksum: string | null
  externalUrl: string | null
  textContent: string | null
  uploadedByMembershipId: string
  createdAt: string
}

export type Evidence = {
  id: string
  organizationId: string
  title: string
  description: string | null
  type: EvidenceType
  status: EvidenceStatus
  owner: EvidenceOwner
  ownerMembershipId: string | null
  createdBy: EvidenceOwner
  createdByMembershipId: string
  effectiveFrom: string | null
  effectiveTo: string | null
  expiresAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  versions: EvidenceVersion[]
  linkedControls: EvidenceControl[]
  linkedExecutions: EvidenceExecution[]
}

export type EvidencePagination = { page: number; pageSize: number; total: number; totalPages: number }
export type EvidenceListParams = {
  search?: string
  status?: EvidenceStatus | "ALL"
  type?: EvidenceType | "ALL"
  controlId?: string
  ownerMembershipId?: string
  createdByMembershipId?: string
  expiresBefore?: string
  page?: number
  pageSize?: number
  sortBy?: "title" | "updatedAt" | "status" | "expiresAt"
  sortOrder?: "asc" | "desc"
}
export type EvidenceListResponse = { data: Evidence[]; pagination: EvidencePagination }
export type EvidenceSummary = {
  total: number
  current: number
  expiringSoon: number
  expired: number
  missingVersion: number
  withoutControl: number
  withoutExecution: number
  traceability: { linkedToControlCount: number; linkedToControlPercent: number; linkedToExecutionCount: number; linkedToExecutionPercent: number; hasVersionCount: number; hasVersionPercent: number }
  recentlyUpdated: Array<{ id: string; title: string; type: EvidenceType; updatedAt: string; owner: string | null; currentVersion: Pick<EvidenceVersion, "versionNumber" | "fileName" | "externalUrl" | "createdAt"> | null }>
  attention: Array<{ id: string; title: string; expiresAt: string | null; reason: string }>
}

function queryString(params: EvidenceListParams) {
  const query = new globalThis.URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "ALL") query.set(key, String(value))
  }
  query.set("page", String(params.page ?? 1))
  query.set("pageSize", String(params.pageSize ?? 10))
  return query.toString()
}

export function getEvidence(organizationId: string, params: EvidenceListParams) { return apiRequest<EvidenceListResponse>(`/organizations/${organizationId}/evidence?${queryString(params)}`) }
export function getEvidenceSummary(organizationId: string) { return apiRequest<EvidenceSummary>(`/organizations/${organizationId}/evidence/summary`) }
export function getEvidenceDetail(organizationId: string, evidenceId: string) { return apiRequest<Evidence>(`/organizations/${organizationId}/evidence/${evidenceId}`) }
export function createEvidence(organizationId: string, body: { title: string; description?: string; type: EvidenceType; ownerMembershipId?: string | null; effectiveFrom?: string | null; effectiveTo?: string | null; expiresAt?: string | null }) { return apiRequest<Evidence>(`/organizations/${organizationId}/evidence`, { method: "POST", body: JSON.stringify(body) }) }
export function updateEvidence(organizationId: string, evidenceId: string, body: Partial<Parameters<typeof createEvidence>[1]>) { return apiRequest<Evidence>(`/organizations/${organizationId}/evidence/${evidenceId}`, { method: "PATCH", body: JSON.stringify(body) }) }
export function archiveEvidence(organizationId: string, evidenceId: string) { return apiRequest<Evidence>(`/organizations/${organizationId}/evidence/${evidenceId}/archive`, { method: "POST" }) }
export function addEvidenceVersion(organizationId: string, evidenceId: string, formData: globalThis.FormData) { return apiRequest<EvidenceVersion>(`/organizations/${organizationId}/evidence/${evidenceId}/versions`, { method: "POST", body: formData }) }
export function getEvidenceVersions(organizationId: string, evidenceId: string) { return apiRequest<{ data: EvidenceVersion[] }>(`/organizations/${organizationId}/evidence/${evidenceId}/versions`) }
export function linkEvidenceControl(organizationId: string, evidenceId: string, controlId: string) { return apiRequest(`/organizations/${organizationId}/evidence/${evidenceId}/controls/${controlId}`, { method: "POST" }) }
export function unlinkEvidenceControl(organizationId: string, evidenceId: string, controlId: string) { return apiRequest<{ deleted: boolean }>(`/organizations/${organizationId}/evidence/${evidenceId}/controls/${controlId}`, { method: "DELETE" }) }
export function getEvidenceControls(organizationId: string, evidenceId: string) { return apiRequest<{ data: EvidenceControl[] }>(`/organizations/${organizationId}/evidence/${evidenceId}/controls`) }
export function getEvidenceForControl(organizationId: string, controlId: string) { return apiRequest<{ data: Evidence[] }>(`/organizations/${organizationId}/controls/${controlId}/evidence`) }
export function linkEvidenceExecution(organizationId: string, evidenceId: string, executionId: string) { return apiRequest(`/organizations/${organizationId}/evidence/${evidenceId}/executions/${executionId}`, { method: "POST" }) }
export function unlinkEvidenceExecution(organizationId: string, evidenceId: string, executionId: string) { return apiRequest<{ deleted: boolean }>(`/organizations/${organizationId}/evidence/${evidenceId}/executions/${executionId}`, { method: "DELETE" }) }
export function getEvidenceExecutions(organizationId: string, evidenceId: string) { return apiRequest<{ data: EvidenceExecution[] }>(`/organizations/${organizationId}/evidence/${evidenceId}/executions`) }
export function getEvidenceForExecution(organizationId: string, executionId: string) { return apiRequest<{ data: Evidence[] }>(`/organizations/${organizationId}/executions/${executionId}/evidence`) }
