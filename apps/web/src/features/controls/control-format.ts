import type { ControlExecution, ControlFrequency, ControlStatus, ControlType, ExecutionStatus } from "./control-api"

export const typeLabel: Record<ControlType, string> = { PREVENTIVE: "Preventive", DETECTIVE: "Detective", CORRECTIVE: "Corrective" }
export const frequencyLabel: Record<ControlFrequency, string> = { CONTINUOUS: "Continuous", DAILY: "Daily", WEEKLY: "Weekly", MONTHLY: "Monthly", QUARTERLY: "Quarterly", SEMI_ANNUAL: "Semi-annual", ANNUAL: "Annual", AD_HOC: "Ad hoc" }
export const automationLabel = { MANUAL: "Manual", AUTOMATED: "Automated", HYBRID: "Hybrid" } as const
export const statusLabel: Record<ControlStatus, string> = { DRAFT: "Draft", ACTIVE: "Active", RETIRED: "Retired", ARCHIVED: "Archived" }
export const executionStatusLabel: Record<ExecutionStatus, string> = { SCHEDULED: "Scheduled", IN_PROGRESS: "In progress", COMPLETED: "Completed", CANCELLED: "Cancelled" }

export function formatDate(value: string | null | undefined, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) { return value ? new Intl.DateTimeFormat("en-US", options).format(new Date(value)) : "—" }
export function formatShortDate(value: string | null | undefined) { return formatDate(value, { month: "short", day: "numeric" }) }
export function formatDateRange(start: string, end: string) { return `${formatShortDate(start)} – ${formatShortDate(end)}` }
export function overdueLabel(execution: ControlExecution) { const days = Math.max(1, Math.ceil((Date.now() - new Date(execution.dueAt).getTime()) / 86400000)); return `${days} day${days === 1 ? "" : "s"} overdue` }
