import { ArrowRight, FileText, Link2, Server, Type } from 'lucide-react';
import Link from 'next/link';

import type { EvidenceSummary, EvidenceType } from './evidence-api';
import { formatEvidenceRelativeDate, versionFileLabel } from './evidence-format';

export function EvidenceWorkspaceOverview({
  summary,
  isLoading,
  isError,
}: {
  summary: EvidenceSummary | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading)
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse border-y border-border-subtle/70 bg-bg-card/20" />
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(250px,.9fr)]">
          <div className="h-72 animate-pulse border-y border-border-subtle/70 bg-bg-card/20" />
          <div className="h-72 animate-pulse border-y border-border-subtle/70 bg-bg-card/20" />
        </div>
      </div>
    );
  if (isError || !summary)
    return (
      <p className="border-y border-danger/30 bg-danger-muted/20 px-4 py-3 text-sm text-danger">
        Unable to load evidence health. The library remains available below.
      </p>
    );
  return (
    <div className="space-y-7">
      <HealthRail summary={summary} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(250px,.9fr)]">
        <RecentlyUpdated summary={summary} />
        <aside className="space-y-8">
          <Traceability summary={summary} />
          <NeedsAttention summary={summary} />
        </aside>
      </div>
    </div>
  );
}

function HealthRail({ summary }: { summary: EvidenceSummary }) {
  const metrics = [
    { label: 'Total', value: summary.total },
    { label: 'Current', value: summary.current },
    { label: 'Expiring', value: summary.expiringSoon, tone: 'warning' },
    { label: 'Expired', value: summary.expired, tone: 'danger' },
    { label: 'Unlinked', value: summary.withoutControl },
  ];
  return (
    <section
      aria-label="Evidence health"
      className="grid grid-cols-2 divide-x divide-y divide-border-subtle/70 rounded-2xl border border-border-subtle/70 bg-bg-card/55 sm:grid-cols-5 sm:divide-y-0"
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="px-4 py-4 sm:px-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
            {metric.label}
          </p>
          <p
            className={`mt-1 font-heading text-2xl ${metric.tone === 'warning' ? 'text-warning' : metric.tone === 'danger' ? 'text-danger' : 'text-text-primary'}`}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function RecentlyUpdated({ summary }: { summary: EvidenceSummary }) {
  return (
    <section>
      <div className="border-b border-border-subtle/70 pb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
          Artifact activity
        </p>
        <h2 className="mt-1 font-heading text-xl text-text-primary">Recently updated</h2>
      </div>
      {summary.recentlyUpdated.length ? (
        <div className="divide-y divide-border-subtle/70">
          {summary.recentlyUpdated.map((item) => (
            <Link
              key={item.id}
              href={`/evidence/${item.id}`}
              className="group flex items-center gap-4 py-4"
            >
              <ArtifactIcon type={item.type} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text-primary">
                  {item.title}
                </span>
                <span className="mt-1 block truncate text-xs text-text-muted">
                  {versionFileLabel(item.currentVersion, item.type)}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  {item.currentVersion ? `v${item.currentVersion.versionNumber}` : 'No version'}
                  {item.owner ? ` · ${item.owner}` : ''} · Updated{' '}
                  {formatEvidenceRelativeDate(item.updatedAt)}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-text-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-10 text-sm text-text-muted">
          No evidence has been updated yet.
        </p>
      )}
    </section>
  );
}

function Traceability({ summary }: { summary: EvidenceSummary }) {
  const metrics = [
    { label: 'Linked to controls', value: summary.traceability.linkedToControlPercent },
    { label: 'Linked to executions', value: summary.traceability.linkedToExecutionPercent },
    { label: 'Has current version', value: summary.traceability.hasVersionPercent },
  ];
  return (
    <section>
      <div className="border-b border-border-subtle/70 pb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
          Repository coverage
        </p>
        <h2 className="mt-1 font-heading text-xl text-text-primary">Traceability</h2>
      </div>
      <div className="space-y-5 pt-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-secondary">{metric.label}</span>
              <span className="font-medium text-text-primary">{metric.value}%</span>
            </div>
            <div className="mt-2 h-1 bg-bg-elevated">
              <div className="h-1 bg-primary" style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NeedsAttention({ summary }: { summary: EvidenceSummary }) {
  return (
    <section>
      <div className="border-b border-border-subtle/70 pb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
          Follow-up
        </p>
        <h2 className="mt-1 font-heading text-xl text-text-primary">Needs attention</h2>
      </div>
      {summary.attention.length ? (
        <div className="divide-y divide-border-subtle/70">
          {summary.attention.map((item) => (
            <Link
              key={item.id}
              href={`/evidence/${item.id}`}
              className="group flex items-center justify-between gap-3 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text-primary">
                  {item.title}
                </span>
                <span className="mt-1 block truncate text-xs text-text-muted">{item.reason}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-text-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-text-primary" />
            </Link>
          ))}
        </div>
      ) : (
        <p className="pt-4 text-sm text-text-muted">No evidence currently needs attention.</p>
      )}
    </section>
  );
}

function ArtifactIcon({ type }: { type: EvidenceType }) {
  const Icon =
    type === 'FILE' ? FileText : type === 'URL' ? Link2 : type === 'TEXT' ? Type : Server;
  return (
    <span className="flex size-9 shrink-0 items-center justify-center border border-border-subtle/70 text-text-muted">
      <Icon className="size-4" />
    </span>
  );
}
