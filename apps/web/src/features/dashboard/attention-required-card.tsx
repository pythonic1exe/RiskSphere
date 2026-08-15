import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { DashboardCard } from './dashboard-card';
import type { DashboardAttentionItem } from './dashboard-types';

const hrefs: Record<DashboardAttentionItem['entityType'], (id: string) => string> = { RISK: (id) => `/risks/${id}`, CONTROL: (id) => `/controls/${id}`, EVIDENCE: (id) => `/evidence/${id}`, FINDING: (id) => `/findings/${id}`, TASK: () => '/tasks' };

export function AttentionRequiredCard({ items }: { items: DashboardAttentionItem[] }) {
  return <DashboardCard title="Attention required" tone="inset">{items.length ? <div className="divide-y divide-border-subtle/60">{items.map((item) => <Link key={item.id} href={hrefs[item.entityType](item.entityId)} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0 hover:text-text-primary"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" /><span className="min-w-0 flex-1"><span className="block text-[10px] uppercase tracking-[0.1em] text-text-muted">{item.entityType}</span><span className="mt-1 block truncate text-sm font-medium text-text-primary">{item.title}</span><span className="mt-1 block text-xs text-text-muted">{item.reason}{item.priority ? ` · ${item.priority}` : ''}</span></span><AlertCircle className="mt-1 size-3.5 shrink-0 text-danger" /></Link>)}</div> : <p className="py-5 text-sm text-text-muted">Nothing requires immediate attention.</p>}</DashboardCard>;
}
