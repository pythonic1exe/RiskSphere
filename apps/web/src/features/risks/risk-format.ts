import type { RiskAssessment, RiskStatus, Severity, TreatmentStatus, TreatmentStrategy } from "./risk-api"

export const statusLabel: Record<RiskStatus, string> = { DRAFT: "Draft", ACTIVE: "Active", CLOSED: "Closed", ARCHIVED: "Archived" }
export const severityLabel: Record<Severity, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" }
export const strategyLabel: Record<TreatmentStrategy, string> = { MITIGATE: "Mitigate", ACCEPT: "Accept", AVOID: "Avoid", TRANSFER: "Transfer" }
export const treatmentStatusLabel: Record<TreatmentStatus, string> = { NOT_STARTED: "Not started", IN_PROGRESS: "In progress", COMPLETED: "Completed" }

export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

export function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value))
}

export function latestAssessment(assessments: RiskAssessment[] | undefined, type?: RiskAssessment["type"]): RiskAssessment | null {
  return (assessments ?? []).filter((assessment) => !type || assessment.type === type).sort((a, b) => +new Date(b.assessedAt) - +new Date(a.assessedAt))[0] ?? null
}

export function severityForScore(score: number): Severity {
  return score <= 4 ? "LOW" : score <= 9 ? "MEDIUM" : score <= 16 ? "HIGH" : "CRITICAL"
}
