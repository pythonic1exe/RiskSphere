import { apiRequest } from "@/features/auth/auth-client"

export type RiskStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED"
export type AssessmentType = "INHERENT" | "RESIDUAL"
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TreatmentStrategy = "MITIGATE" | "ACCEPT" | "AVOID" | "TRANSFER"
export type TreatmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

export type RiskAssessment = {
  id: string
  organizationId: string
  riskId: string
  type: AssessmentType
  likelihood: number
  impact: number
  score: number
  severity: Severity
  rationale: string | null
  assessedByMembershipId: string
  assessedAt: string
  createdAt: string
}

export type RiskTreatment = {
  id: string
  organizationId: string
  riskId: string
  strategy: TreatmentStrategy
  status: TreatmentStatus
  plan: string | null
  targetDate: string | null
  ownerMembershipId: string | null
  acceptedByMembershipId: string | null
  acceptedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Risk = {
  id: string
  organizationId: string
  code: string
  title: string
  description: string | null
  category: string | null
  status: RiskStatus
  ownerMembershipId: string | null
  nextReviewAt: string | null
  lastReviewedAt: string | null
  createdByMembershipId: string
  updatedByMembershipId: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  ownerMembership?: { id: string; status: string } | null
  treatment?: RiskTreatment | null
  assessments?: RiskAssessment[]
}

export type RiskListResponse = {
  data: Risk[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

export type RiskListParams = {
  search?: string
  status?: RiskStatus | "ALL"
  category?: string
  ownerMembershipId?: string
  page?: number
  pageSize?: number
}

function queryString(params: RiskListParams) {
  const query = new globalThis.URLSearchParams()
  if (params.search) query.set("search", params.search)
  if (params.status && params.status !== "ALL") query.set("status", params.status)
  if (params.category && params.category !== "ALL") query.set("category", params.category)
  if (params.ownerMembershipId && params.ownerMembershipId !== "ALL") query.set("ownerMembershipId", params.ownerMembershipId)
  query.set("page", String(params.page ?? 1))
  query.set("pageSize", String(params.pageSize ?? 10))
  return query.toString()
}

export function getRisks(organizationId: string, params: RiskListParams) {
  return apiRequest<RiskListResponse>(`/organizations/${organizationId}/risks?${queryString(params)}`)
}

export function getRisk(organizationId: string, riskId: string) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks/${riskId}`)
}

export function createRisk(organizationId: string, body: { title: string; description?: string; category?: string; ownerMembershipId?: string }) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks`, { method: "POST", body: JSON.stringify(body) })
}

export function updateRisk(organizationId: string, riskId: string, body: { title?: string; description?: string; category?: string; ownerMembershipId?: string; status?: "DRAFT" | "ACTIVE" }) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks/${riskId}`, { method: "PATCH", body: JSON.stringify(body) })
}

export function createAssessment(organizationId: string, riskId: string, body: { type: AssessmentType; likelihood: number; impact: number; rationale?: string }) {
  return apiRequest<RiskAssessment>(`/organizations/${organizationId}/risks/${riskId}/assessments`, { method: "POST", body: JSON.stringify(body) })
}

export function updateTreatment(organizationId: string, riskId: string, body: { strategy: TreatmentStrategy; status?: TreatmentStatus; plan?: string; targetDate?: string; ownerMembershipId?: string }) {
  return apiRequest<RiskTreatment>(`/organizations/${organizationId}/risks/${riskId}/treatment`, { method: "PUT", body: JSON.stringify(body) })
}

export function reviewRisk(organizationId: string, riskId: string, nextReviewAt: string) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks/${riskId}/review`, { method: "POST", body: JSON.stringify({ nextReviewAt }) })
}

export function closeRisk(organizationId: string, riskId: string) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks/${riskId}/close`, { method: "POST" })
}

export function archiveRisk(organizationId: string, riskId: string) {
  return apiRequest<Risk>(`/organizations/${organizationId}/risks/${riskId}/archive`, { method: "POST" })
}
