import type { DashboardData } from "./dashboard-data"

export function MetricCard({ metric }: { metric: DashboardData["metrics"][number] }) {
  const tone = metric.tone === "danger" ? "text-danger" : metric.tone === "success" ? "text-success" : "text-primary"
  return <div className="min-w-0 flex-1 border-l border-border-subtle/70 pl-5 first:border-l-0 first:pl-0"><p className="text-sm text-text-muted">{metric.label}</p><p className="mt-2 font-heading text-3xl tracking-[-0.07em] text-text-primary">{metric.value}</p><p className={`mt-1 text-xs ${tone}`}>{metric.detail}</p></div>
}
