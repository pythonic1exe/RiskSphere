import type { ComplianceRequirementStatus } from "./compliance-api"

export const statusLabel: Record<ComplianceRequirementStatus, string> = { COMPLIANT: "Compliant", PARTIALLY_COMPLIANT: "Partially compliant", NON_COMPLIANT: "Non-compliant", IN_PROGRESS: "In progress", NOT_ASSESSED: "Not assessed", NOT_APPLICABLE: "Not applicable" }
export const statusTone: Record<ComplianceRequirementStatus, string> = { COMPLIANT: "text-success", PARTIALLY_COMPLIANT: "text-warning", NON_COMPLIANT: "text-danger", IN_PROGRESS: "text-primary", NOT_ASSESSED: "text-text-muted", NOT_APPLICABLE: "text-text-secondary" }
export function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—" }
export function canManageCompliance(roles: Array<{ code: string }>) { return roles.some((role) => ["OWNER", "GRC_ADMIN", "COMPLIANCE_MANAGER"].includes(role.code)) }
