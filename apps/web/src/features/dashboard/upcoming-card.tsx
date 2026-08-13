import { DashboardCard } from "./dashboard-card"
import type { DashboardData } from "./dashboard-data"

export function UpcomingCard({ items }: { items: DashboardData["upcoming"] }) {
  return <DashboardCard title="Upcoming" tone="quiet"><div className="space-y-4">{items.map((item) => <div key={item.title} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3"><span className={`pt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${item.date === "Today" ? "text-primary" : "text-text-muted"}`}>{item.date}</span><div className="min-w-0"><p className="truncate text-sm text-text-secondary">{item.title}</p><p className="mt-1 text-xs text-text-disabled">{item.type}</p></div></div>)}</div></DashboardCard>
}
