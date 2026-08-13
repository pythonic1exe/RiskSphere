import { DashboardCard } from "./dashboard-card"
import type { DashboardData } from "./dashboard-data"

export function RecentActivityCard({ items }: { items: DashboardData["activity"] }) {
  return <DashboardCard title="Recent activity" tone="quiet"><div className="grid gap-x-8 lg:grid-cols-2">{items.map((item) => <div key={`${item.actor}-${item.entity}`} className="flex items-center gap-3 py-3.5 first:pt-0 lg:py-3.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-[9px] font-medium text-text-secondary">{item.actor}</span><p className="min-w-0 flex-1 truncate text-sm text-text-muted">{item.action} <span className="font-medium text-text-primary">{item.entity}</span></p><span className="shrink-0 text-xs text-text-disabled">{item.time}</span></div>)}</div></DashboardCard>
}
