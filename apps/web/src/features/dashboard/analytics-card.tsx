import { DashboardCard } from './dashboard-card';

export function AnalyticsCard({ distribution }: { distribution: Record<string, number> }) {
  const entries = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((key) => [key, distribution[key] ?? 0] as const);
  const maximum = Math.max(1, ...entries.map(([, value]) => value));
  return <DashboardCard title="Risk severity" description="Current risk distribution across the organization." tone="inset"><div className="flex h-52 items-end justify-around gap-4 border-b border-border-subtle/70 px-3 pb-0 pt-5">{entries.map(([severity, value]) => <div key={severity} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-sm text-text-primary">{value}</span><div className={`w-full max-w-12 rounded-t-lg ${severity === 'CRITICAL' ? 'bg-danger' : severity === 'HIGH' ? 'bg-warning' : severity === 'MEDIUM' ? 'bg-primary' : 'bg-text-muted'}`} style={{ height: `${Math.max(4, (value / maximum) * 75)}%` }} /><span className="text-[10px] uppercase tracking-[0.08em] text-text-muted">{severity.slice(0, 3)}</span></div>)}</div></DashboardCard>;
}
