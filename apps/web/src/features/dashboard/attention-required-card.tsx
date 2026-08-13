import { AlertCircle, AlertTriangle, Info } from "lucide-react"
import { DashboardCard } from "./dashboard-card"
import type { DashboardData } from "./dashboard-data"

const icons = { danger: AlertCircle, warning: AlertTriangle, info: Info }
const colors = { danger: "bg-danger", warning: "bg-warning", info: "bg-primary" }

export function AttentionRequiredCard({ items }: { items: DashboardData["attention"] }) {
  return <DashboardCard title="Attention required" tone="inset"><div className="space-y-1">{items.map((item) => { const Icon = icons[item.tone]; return <div key={item.label} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"><span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${colors[item.tone]}`} /><div className="min-w-0 flex-1"><p className={`truncate text-sm ${item.tone === "danger" ? "font-medium text-text-primary" : "text-text-secondary"}`}>{item.label}</p><p className="mt-1 text-xs text-text-muted">{item.detail}</p></div><Icon className={`mt-0.5 size-3.5 shrink-0 ${item.tone === "danger" ? "text-danger" : item.tone === "warning" ? "text-warning" : "text-text-disabled"}`} /></div> })}</div></DashboardCard>
}
