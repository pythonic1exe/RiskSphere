import type { Evidence, EvidenceStatus, EvidenceType, EvidenceVersion } from "./evidence-api"

export const evidenceTypeLabel: Record<EvidenceType, string> = { FILE: "File", URL: "URL", TEXT: "Text", SYSTEM_RECORD: "System record" }
export const evidenceStatusLabel: Record<EvidenceStatus, string> = { DRAFT: "Draft", ACTIVE: "Active", EXPIRED: "Expired", ARCHIVED: "Archived" }
export function formatEvidenceDate(value: string | null | undefined) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—" }
export function formatEvidenceShortDate(value: string | null | undefined) { return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value)) : "—" }
export function formatFileSize(size: number | null | undefined) { if (size === null || size === undefined) return "—"; if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; return `${(size / (1024 * 1024)).toFixed(1)} MB` }
export function shortenChecksum(value: string | null | undefined) { return value ? `${value.slice(0, 12)}…${value.slice(-8)}` : "—" }
export function daysUntil(value: string | null | undefined) { return value ? Math.ceil((new Date(value).getTime() - Date.now()) / 86400000) : null }
export function isExpiringSoon(evidence: Pick<Evidence, "expiresAt" | "status">) { const days = daysUntil(evidence.expiresAt); return evidence.status !== "ARCHIVED" && days !== null && days >= 0 && days <= 30 }
export function expiryLabel(evidence: Pick<Evidence, "expiresAt" | "status">) { const days = daysUntil(evidence.expiresAt); if (evidence.status === "EXPIRED" || (days !== null && days < 0)) return "Expired"; if (isExpiringSoon(evidence)) return `Expires in ${days}d`; return formatEvidenceShortDate(evidence.expiresAt) }
export function latestVersion(evidence: Pick<Evidence, "versions">) { return evidence.versions?.[0] ?? null }
export function versionFileLabel(version: Pick<EvidenceVersion, "fileName" | "externalUrl"> | null, type: EvidenceType) { if (!version) return type === "URL" ? "External URL" : type === "TEXT" ? "Text content" : type === "SYSTEM_RECORD" ? "System record" : "No version added"; return version.fileName ?? (version.externalUrl ? version.externalUrl : type === "TEXT" ? "Text content" : "System record") }
export function versionUploaderLabel(version: EvidenceVersion | null) { return version?.uploadedByMembershipId ? `Member ${version.uploadedByMembershipId.slice(0, 8)}` : "Organization member" }
export function formatEvidenceRelativeDate(value: string) { const date = new Date(value); const diff = Date.now() - date.getTime(); if (diff < 60_000) return "just now"; if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`; if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`; if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`; return formatEvidenceShortDate(value) }
