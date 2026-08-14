import { ChevronRight } from "lucide-react"
import type { ControlExecution, ControlStatus, ExecutionStatus } from "./control-api"
import { executionStatusLabel, overdueLabel, statusLabel } from "./control-format"

export function ControlStatusText({ status }: { status: ControlStatus }) { return <span className="text-sm text-text-secondary">{statusLabel[status]}</span> }
export function ExecutionStatusText({ execution }: { execution: ControlExecution }) { return <span className="inline-flex flex-col text-sm"><span className={execution.status === "COMPLETED" ? "text-success" : execution.status === "CANCELLED" ? "text-text-muted" : execution.status === "IN_PROGRESS" ? "text-text-primary" : "text-text-secondary"}>{executionStatusLabel[execution.status]}</span>{execution.isOverdue ? <span className="mt-0.5 text-xs text-warning">{overdueLabel(execution)}</span> : null}</span> }
export function TypeIndicator({ label }: { label: string }) { return <span className="text-sm text-text-secondary"><span className="mr-2 text-text-disabled">●</span>{label}</span> }
export function RowChevron() { return <ChevronRight className="size-4 text-text-disabled opacity-0 transition-opacity group-hover:opacity-100" /> }
export function canStart(status: ExecutionStatus) { return status === "SCHEDULED" }
export function canComplete(status: ExecutionStatus) { return status === "SCHEDULED" || status === "IN_PROGRESS" }
