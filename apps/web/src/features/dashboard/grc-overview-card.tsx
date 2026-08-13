import { Check } from "lucide-react"
import { DashboardCard } from "./dashboard-card"
import type { DashboardData } from "./dashboard-data"

export function GrcOverviewCard({ data }: { data: DashboardData }) {
  return <DashboardCard title="GRC overview" description="A clear view of where your program stands today.">
    <div className="flex items-end justify-between gap-5"><div><p className="font-heading text-6xl tracking-[-0.1em] text-text-primary sm:text-7xl">{data.readiness}<span className="text-3xl text-primary">%</span></p><p className="mt-2 text-sm text-text-muted">Overall readiness</p></div><span className="mb-2 flex size-9 items-center justify-center rounded-full bg-success-muted text-success"><Check className="size-4" /></span></div>
    <div className="mt-8 space-y-4">{data.readinessBreakdown.map((item) => <div key={item.label}><div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="text-text-secondary">{item.label}</span><span className="font-medium text-text-primary">{item.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated"><div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} /></div></div>)}</div>
  </DashboardCard>
}
