import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Severity, RiskStatus } from "./risk-api"
import { severityLabel, statusLabel } from "./risk-format"

export function SeverityIndicator({ severity }: { severity?: Severity | null }) {
  const tone = severity === "CRITICAL" ? "text-risk-critical" : severity === "HIGH" ? "text-risk-high" : severity === "MEDIUM" ? "text-risk-medium" : severity === "LOW" ? "text-risk-low" : "text-text-muted"
  return <span className={cn("inline-flex items-center gap-2 text-sm", tone)}><span className="size-1.5 rounded-full bg-current" />{severity ? severityLabel[severity] : "Unrated"}</span>
}

export function StatusText({ status }: { status: RiskStatus }) {
  return <span className={cn("text-sm", status === "ACTIVE" ? "text-text-secondary" : status === "CLOSED" ? "text-text-muted" : status === "ARCHIVED" ? "text-text-disabled" : "text-text-muted")}>{statusLabel[status]}</span>
}

export function RowChevron() { return <ChevronRight className="size-4 text-text-disabled opacity-0 transition-opacity group-hover:opacity-100" /> }
