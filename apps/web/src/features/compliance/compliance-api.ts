import { apiRequest } from "@/features/auth/auth-client"

export type ComplianceFrameworkStatus = "ACTIVE" | "ARCHIVED"
export type ComplianceRequirementStatus = "COMPLIANT" | "PARTIALLY_COMPLIANT" | "NON_COMPLIANT" | "IN_PROGRESS" | "NOT_ASSESSED" | "NOT_APPLICABLE"
export type MemberSummary = { id: string; name: string }
export type Pagination = { page: number; pageSize: number; total: number; totalPages: number }

export type ComplianceSummary = { totalRequirements: number; compliant: number; partiallyCompliant: number; nonCompliant: number; inProgress: number; notAssessed: number; notApplicable: number; compliancePercent: number; assessmentCoveragePercent: number; controlCoveragePercent: number }
export type ComplianceFramework = { id: string; organizationId: string; frameworkCatalogId: string; code: string; name: string; version: string; status: ComplianceFrameworkStatus; owner: MemberSummary | null; targetDate: string | null; archivedAt?: string | null; summary: ComplianceSummary }
export type FrameworkCatalogItem = { id: string; code: string; name: string; version: string; description?: string | null; status: string }
export type ComplianceRequirement = { id: string; organizationFrameworkId: string; code: string; title: string; description: string | null; domain: string | null; parentRequirementId: string | null; status: ComplianceRequirementStatus; owner: MemberSummary | null; notes?: string | null; targetDate?: string | null; nextReviewAt?: string | null; applicabilityReason?: string | null; linkedControls: LinkedControl[]; lastAssessedAt?: string | null; latestAssessment?: ComplianceAssessment | null; assessments?: ComplianceAssessment[]; framework?: { id: string; code: string; name: string; version: string; status: ComplianceFrameworkStatus } }
export type LinkedControl = { id: string; code: string; title: string; type: string; frequency: string; status: string; category?: string | null }
export type ComplianceAssessment = { id: string; status: ComplianceRequirementStatus; rationale: string; assessedBy: MemberSummary | null; assessedByMembershipId: string; assessedAt: string; createdAt: string }
export type LinkedRequirement = { id: string; code: string; title: string; status: ComplianceRequirementStatus; framework: { code: string; name: string; version: string } }

export type FrameworkListParams = { status?: ComplianceFrameworkStatus | "ALL"; page?: number; pageSize?: number; search?: string }
export type RequirementListParams = { search?: string; status?: ComplianceRequirementStatus | "ALL"; ownerMembershipId?: string; domain?: string; hasControls?: "true" | "false" | "ALL"; page?: number; pageSize?: number; sortBy?: "code" | "title" | "domain" | "status" | "updatedAt"; sortOrder?: "asc" | "desc" }

function queryString(params: Record<string, string | number | undefined>) { const query = new globalThis.URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== "" && value !== "ALL") query.set(key, String(value)) }); return query.toString() }

export function getFrameworkCatalog() { return apiRequest<{ frameworks: FrameworkCatalogItem[] }>("/frameworks/framework-catalog") }
export function getComplianceFrameworks(organizationId: string, params: FrameworkListParams = {}) { return apiRequest<{ data: ComplianceFramework[]; pagination: Pagination }>(`/organizations/${organizationId}/compliance/frameworks?${queryString({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 20 })}`) }
export function getComplianceFramework(organizationId: string, frameworkId: string) { return apiRequest<ComplianceFramework>(`/organizations/${organizationId}/compliance/frameworks/${frameworkId}`) }
export function adoptComplianceFramework(organizationId: string, body: { frameworkCatalogId: string; ownerMembershipId?: string; targetDate?: string }) { return apiRequest<ComplianceFramework>(`/organizations/${organizationId}/compliance/frameworks`, { method: "POST", body: JSON.stringify(body) }) }
export function archiveComplianceFramework(organizationId: string, frameworkId: string) { return apiRequest<ComplianceFramework>(`/organizations/${organizationId}/compliance/frameworks/${frameworkId}/archive`, { method: "POST" }) }
export function getRequirements(organizationId: string, frameworkId: string, params: RequirementListParams) { return apiRequest<{ data: ComplianceRequirement[]; pagination: Pagination }>(`/organizations/${organizationId}/compliance/frameworks/${frameworkId}/requirements?${queryString({ ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 20 })}`) }
export function getRequirement(organizationId: string, requirementId: string) { return apiRequest<ComplianceRequirement>(`/organizations/${organizationId}/compliance/requirements/${requirementId}`) }
export function updateRequirement(organizationId: string, requirementId: string, body: { ownerMembershipId?: string | null; notes?: string | null; targetDate?: string | null; nextReviewAt?: string | null; applicabilityReason?: string | null }) { return apiRequest<ComplianceRequirement>(`/organizations/${organizationId}/compliance/requirements/${requirementId}`, { method: "PATCH", body: JSON.stringify(body) }) }
export function createRequirementAssessment(organizationId: string, requirementId: string, body: { status: ComplianceRequirementStatus; rationale?: string }) { return apiRequest<ComplianceRequirement>(`/organizations/${organizationId}/compliance/requirements/${requirementId}/assessments`, { method: "POST", body: JSON.stringify(body) }) }
export function getRequirementControls(organizationId: string, requirementId: string) { return apiRequest<{ data: LinkedControl[] }>(`/organizations/${organizationId}/compliance/requirements/${requirementId}/controls`) }
export function linkRequirementControl(organizationId: string, requirementId: string, controlId: string) { return apiRequest<{ data: LinkedControl[] }>(`/organizations/${organizationId}/compliance/requirements/${requirementId}/controls/${controlId}`, { method: "POST" }) }
export function unlinkRequirementControl(organizationId: string, requirementId: string, controlId: string) { return apiRequest<{ deleted: boolean }>(`/organizations/${organizationId}/compliance/requirements/${requirementId}/controls/${controlId}`, { method: "DELETE" }) }
export function getControlRequirements(organizationId: string, controlId: string) { return apiRequest<{ data: LinkedRequirement[] }>(`/organizations/${organizationId}/compliance/controls/${controlId}/requirements`) }
