import { apiRequest } from "@/features/auth/auth-client"

export type ControlType = "PREVENTIVE" | "DETECTIVE" | "CORRECTIVE"
export type ControlAutomationType = "MANUAL" | "AUTOMATED" | "HYBRID"
export type ControlFrequency = "CONTINUOUS" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "AD_HOC"
export type ControlStatus = "DRAFT" | "ACTIVE" | "RETIRED" | "ARCHIVED"
export type ExecutionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export type MemberSummary = { id: string; name: string }
export type LinkedRisk = { id: string; code: string; title: string; status: string; category?: string | null }
export type LinkedRequirement = { id: string; code: string; title: string; status: string; framework: { code: string; name: string; version: string } }
export type ControlExecution = {
  id: string
  controlId: string
  periodLabel: string
  periodStart: string
  periodEnd: string
  dueAt: string
  status: ExecutionStatus
  isOverdue: boolean
  assignedTo: MemberSummary | null
  startedAt: string | null
  completedAt: string | null
  completedByMembershipId: string | null
  completionNotes: string | null
  createdByMembershipId: string
  createdAt: string
  updatedAt: string
}

export type Control = {
  id: string
  organizationId: string
  code: string
  title: string
  description: string | null
  category: string | null
  type: ControlType
  automationType: ControlAutomationType
  frequency: ControlFrequency
  status: ControlStatus
  owner: MemberSummary | null
  createdByMembershipId: string
  updatedByMembershipId: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  linkedRiskCount: number
  linkedRisks: LinkedRisk[]
  nextExecution: ControlExecution | null
  recentExecutions: ControlExecution[]
}

export type ControlListResponse = { data: Control[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export type ControlSummary = {
  total: number
  active: number
  overdueExecutions: number
  dueSoon: number
  unscheduled: number
  openExecutions: number
  completedExecutions: number
  attention: Array<{ id: string; controlId: string; code: string; title: string; periodLabel: string; dueAt: string; status: ExecutionStatus; reason: string }>
}
export type ControlListParams = { search?: string; status?: ControlStatus | "ALL"; type?: ControlType | "ALL"; automationType?: ControlAutomationType | "ALL"; frequency?: ControlFrequency | "ALL"; ownerMembershipId?: string; riskId?: string; page?: number; pageSize?: number; sortBy?: "code" | "title" | "updatedAt" | "status"; sortOrder?: "asc" | "desc" }

function queryString(params: ControlListParams) {
  const query = new globalThis.URLSearchParams()
  if (params.search) query.set("search", params.search)
  for (const [key, value] of Object.entries(params)) {
    if (key === "search" || key === "page" || key === "pageSize" || value === undefined || value === "ALL") continue
    query.set(key, String(value))
  }
  query.set("page", String(params.page ?? 1)); query.set("pageSize", String(params.pageSize ?? 10))
  return query.toString()
}

export function getControls(organizationId: string, params: ControlListParams) { return apiRequest<ControlListResponse>(`/organizations/${organizationId}/controls?${queryString(params)}`) }
export function getControlSummary(organizationId: string) { return apiRequest<ControlSummary>(`/organizations/${organizationId}/controls/summary`) }
export function getControl(organizationId: string, controlId: string) { return apiRequest<Control>(`/organizations/${organizationId}/controls/${controlId}`) }
export function createControl(organizationId: string, body: { title: string; description?: string; category?: string; type: ControlType; automationType: ControlAutomationType; frequency: ControlFrequency; ownerMembershipId?: string }) { return apiRequest<Control>(`/organizations/${organizationId}/controls`, { method: "POST", body: JSON.stringify(body) }) }
export function updateControl(organizationId: string, controlId: string, body: Partial<Omit<Parameters<typeof createControl>[1], "ownerMembershipId">> & { ownerMembershipId?: string }) { return apiRequest<Control>(`/organizations/${organizationId}/controls/${controlId}`, { method: "PATCH", body: JSON.stringify(body) }) }
export function activateControl(organizationId: string, controlId: string) { return apiRequest<Control>(`/organizations/${organizationId}/controls/${controlId}/activate`, { method: "POST" }) }
export function retireControl(organizationId: string, controlId: string) { return apiRequest<Control>(`/organizations/${organizationId}/controls/${controlId}/retire`, { method: "POST" }) }
export function archiveControl(organizationId: string, controlId: string) { return apiRequest<Control>(`/organizations/${organizationId}/controls/${controlId}/archive`, { method: "POST" }) }

export function getControlExecutions(organizationId: string, controlId: string) { return apiRequest<{ data: ControlExecution[] }>(`/organizations/${organizationId}/controls/${controlId}/executions`) }
export function createControlExecution(organizationId: string, controlId: string, body: { periodLabel: string; periodStart: string; periodEnd: string; dueAt: string; assignedToMembershipId?: string }) { return apiRequest<ControlExecution>(`/organizations/${organizationId}/controls/${controlId}/executions`, { method: "POST", body: JSON.stringify(body) }) }
export function updateControlExecution(organizationId: string, controlId: string, executionId: string, body: Partial<{ periodLabel: string; periodStart: string; periodEnd: string; dueAt: string; assignedToMembershipId: string; completionNotes: string }>) { return apiRequest<ControlExecution>(`/organizations/${organizationId}/controls/${controlId}/executions/${executionId}`, { method: "PATCH", body: JSON.stringify(body) }) }
export function startControlExecution(organizationId: string, controlId: string, executionId: string) { return apiRequest<ControlExecution>(`/organizations/${organizationId}/controls/${controlId}/executions/${executionId}/start`, { method: "POST" }) }
export function completeControlExecution(organizationId: string, controlId: string, executionId: string, completionNotes?: string) { return apiRequest<ControlExecution>(`/organizations/${organizationId}/controls/${controlId}/executions/${executionId}/complete`, { method: "POST", body: JSON.stringify(completionNotes ? { completionNotes } : {}) }) }
export function cancelControlExecution(organizationId: string, controlId: string, executionId: string) { return apiRequest<ControlExecution>(`/organizations/${organizationId}/controls/${controlId}/executions/${executionId}/cancel`, { method: "POST" }) }

export function getControlRisks(organizationId: string, controlId: string) { return apiRequest<{ data: LinkedRisk[] }>(`/organizations/${organizationId}/controls/${controlId}/risks`) }
export function linkRisk(organizationId: string, controlId: string, riskId: string) { return apiRequest(`/organizations/${organizationId}/controls/${controlId}/risks/${riskId}`, { method: "POST" }) }
export function unlinkRisk(organizationId: string, controlId: string, riskId: string) { return apiRequest(`/organizations/${organizationId}/controls/${controlId}/risks/${riskId}`, { method: "DELETE" }) }
export function getRiskControls(organizationId: string, riskId: string) { return apiRequest<{ data: Control[] }>(`/organizations/${organizationId}/risks/${riskId}/controls`) }
export function getControlRequirements(organizationId: string, controlId: string) { return apiRequest<{ data: LinkedRequirement[] }>(`/organizations/${organizationId}/compliance/controls/${controlId}/requirements`) }
