import { dashboardData } from "./dashboard-data"
import { AnalyticsCard } from "./analytics-card"
import { AttentionRequiredCard } from "./attention-required-card"
import { GrcOverviewCard } from "./grc-overview-card"
import { MetricCard } from "./metric-card"
import { MyTasksCard } from "./my-tasks-card"
import { RecentActivityCard } from "./recent-activity-card"
import { UpcomingCard } from "./upcoming-card"

export function DashboardHome() {
  return <div className="space-y-5"><div className="grid items-stretch gap-5 lg:grid-cols-2"><GrcOverviewCard data={dashboardData} /><AnalyticsCard data={dashboardData} /></div><div className="flex flex-col gap-5 rounded-[17px] border border-border-subtle/60 bg-bg-card/55 p-5 sm:flex-row sm:p-6">{dashboardData.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div><div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]"><MyTasksCard tasks={dashboardData.tasks} /><AttentionRequiredCard items={dashboardData.attention} /></div><div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)]"><UpcomingCard items={dashboardData.upcoming} /><RecentActivityCard items={dashboardData.activity} /></div></div>
}
