import { ChevronRight } from "lucide-react"
import { DashboardCard } from "./dashboard-card"
import type { DashboardData } from "./dashboard-data"

export function MyTasksCard({ tasks }: { tasks: DashboardData["tasks"] }) {
  return <DashboardCard title="My tasks" className="lg:min-h-[356px]"><div className="space-y-1">{tasks.map((task) => <div key={task.title} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-text-primary">{task.title}</p><p className="mt-1 text-xs text-text-muted">{task.entity}</p></div><div className="shrink-0 text-right"><p className={`text-xs ${task.status === "Due today" ? "text-warning" : "text-text-secondary"}`}>{task.due}</p><p className="mt-1 text-[10px] text-text-disabled">{task.status}</p></div><ChevronRight className="size-3 shrink-0 text-text-disabled" /></div>)}</div></DashboardCard>
}
