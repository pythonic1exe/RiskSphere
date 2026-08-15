'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardOverview } from './dashboard-hooks';
import { AnalyticsCard } from './analytics-card';
import { AttentionRequiredCard } from './attention-required-card';
import { GrcOverviewCard } from './grc-overview-card';
import { MyTasksCard } from './my-tasks-card';
import { RecentActivityCard } from './recent-activity-card';
import { UpcomingCard } from './upcoming-card';

function Skeleton({ className = '' }: { className?: string }) { return <div className={`animate-pulse rounded-xl bg-bg-elevated/60 ${className}`} />; }

function LoadingDashboard() { return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div><Skeleton className="h-28" /><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-52" /><Skeleton className="h-52" /></div></div>; }

export function DashboardHome({ organizationId }: { organizationId: string }) {
  const query = useDashboardOverview(organizationId);
  if (query.isLoading) return <LoadingDashboard />;
  if (query.isError || !query.data) return <div className="rounded-2xl border border-danger/30 bg-danger-muted/10 p-6 text-sm text-danger"><p>Unable to load dashboard data.</p><Button variant="outline" size="sm" className="mt-4" onClick={() => void query.refetch()}><RefreshCw className="size-3.5" />Retry</Button></div>;
  const dashboard = query.data;
  return <div className="space-y-5"><div className="grid items-stretch gap-5 lg:grid-cols-2"><GrcOverviewCard posture={dashboard.posture} /><AnalyticsCard distribution={dashboard.riskDistribution} /></div><div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border-subtle/70 rounded-[17px] border border-border-subtle/60 bg-bg-card/55 sm:grid-cols-4 sm:divide-y-0">{[['Risks', `${dashboard.posture.risks.active} active`, `${dashboard.posture.risks.highCritical} high / critical`], ['Compliance', `${dashboard.posture.compliance.percentage}%`, `${dashboard.posture.compliance.assessmentCoveragePercentage}% assessed`], ['Controls', `${dashboard.posture.controls.active} active`, `${dashboard.posture.controls.overdueExecutions} overdue`], ['Evidence', `${dashboard.posture.evidence.current} current`, `${dashboard.posture.evidence.expired} expired`]].map(([label, value, detail]) => <div key={label} className="p-5 sm:p-6"><p className="text-[11px] uppercase tracking-[0.08em] text-text-muted">{label}</p><p className="mt-2 font-heading text-2xl text-text-primary">{value}</p><p className="mt-1 text-xs text-text-muted">{detail}</p></div>)}</div><div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]"><MyTasksCard tasks={dashboard.myTasks} /><AttentionRequiredCard items={dashboard.attention} /></div><div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.3fr)]"><UpcomingCard items={dashboard.upcoming} /><RecentActivityCard items={dashboard.recentlyUpdated} /></div></div>;
}
