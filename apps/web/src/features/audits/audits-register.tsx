'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, ClipboardCheck, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MorphNativeSelect } from '@/components/ui/morph-select';
import { getMyOrganizations } from '@/features/auth/auth-client';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';
import {
  getAudits,
  getOrganizationMembers,
  type Audit,
  type AuditListParams,
  type AuditStatus,
  type AuditType,
} from './audit-api';
import {
  auditStatusLabel,
  auditTypeLabel,
  formatAuditDate,
  formatAuditDateRange,
  statusTone,
} from './audit-format';
import { AuditRegisterSkeleton } from './audit-loading';
import { NewAuditSheet } from './audit-sheets';

function useActiveOrganization() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    select: (organizations) =>
      organizations.find(
        (item) => item.status === 'ACTIVE' && item.onboarding?.status === 'COMPLETED',
      ) ?? null,
  });
}
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="border-y border-border-subtle py-16 text-center">
      <ClipboardCheck className="mx-auto size-7 text-text-muted" />
      <p className="mt-4 font-heading text-lg text-text-primary">
        No audits have been created yet.
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
        Create an audit to define scope, assign auditors, and begin assurance testing.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus className="size-4" />
        New Audit
      </Button>
    </div>
  );
}
function ActiveEngagements({
  audits,
  isLoading,
  onOpen,
}: {
  audits: Audit[];
  isLoading: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
          Engagement workspace
        </p>
        <h2 className="mt-1 font-heading text-xl text-text-primary">Active engagements</h2>
        <p className="mt-1 text-sm text-text-muted">
          Live assurance work moving through testing and review.
        </p>
      </div>
      {isLoading ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          <AuditRegisterSkeleton />
        </div>
      ) : audits.length ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          {audits.map((audit) => (
            <button
              type="button"
              key={audit.id}
              onClick={() => onOpen(audit.id)}
              className="group grid w-full gap-4 px-1 py-5 text-left transition-colors hover:bg-bg-hover/30 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,1fr)_auto] md:items-center"
            >
              <span className="min-w-0">
                <span
                  className={`text-[11px] font-medium uppercase tracking-[0.1em] ${statusTone(audit.status)}`}
                >
                  {auditStatusLabel[audit.status]}
                </span>
                <span className="mt-2 block truncate font-heading text-lg text-text-primary">
                  {audit.title}
                </span>
                <span className="mt-1 block text-sm text-text-muted">
                  {audit.code} · {auditTypeLabel[audit.type]} ·{' '}
                  {formatAuditDateRange(audit.plannedStartAt, audit.plannedEndAt)}
                </span>
              </span>
              <span>
                <span className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-text-secondary">
                    {audit.testSummary.completed} of {audit.testSummary.total} tests complete
                  </span>
                  <span className="font-medium text-text-primary">
                    {audit.testSummary.completionPercent}%
                  </span>
                </span>
                <span className="mt-2 block h-1 overflow-hidden bg-bg-elevated">
                  <span
                    className="block h-full bg-primary"
                    style={{ width: `${audit.testSummary.completionPercent}%` }}
                  />
                </span>
                <span className="mt-2 block text-xs text-text-muted">
                  {audit.testSummary.pass} Pass · {audit.testSummary.exception} Exception ·{' '}
                  {audit.testSummary.fail} Fail
                </span>
              </span>
              <span className="flex items-center justify-end gap-3 text-sm text-text-muted">
                <span>{audit.leadAuditor?.name ?? 'No lead auditor'}</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-10 text-sm text-text-muted">
          No audits are currently in progress or under review.
        </p>
      )}
    </section>
  );
}
function AuditRow({ audit, onOpen }: { audit: Audit; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full gap-3 border-b border-border-subtle/50 px-5 py-4 text-left last:border-0 transition-colors hover:bg-bg-hover/35 md:grid-cols-[minmax(220px,1.5fr)_120px_110px_130px_120px_110px_100px] md:items-center md:gap-4"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-text-primary">{audit.title}</span>
        <span className="mt-1 block truncate text-xs text-text-muted">{audit.code}</span>
      </span>
      <span className="text-sm text-text-secondary">{auditTypeLabel[audit.type]}</span>
      <span className="text-sm text-text-secondary">{audit.counts.scopes} items</span>
      <span>
        <span className="block text-sm text-text-secondary">
          {audit.testSummary.completed} / {audit.testSummary.total}
        </span>
        <span className="mt-1 block h-1 bg-bg-elevated">
          <span
            className="block h-full bg-primary"
            style={{ width: `${audit.testSummary.completionPercent}%` }}
          />
        </span>
      </span>
      <span className="truncate text-sm text-text-secondary">
        {audit.leadAuditor?.name ?? 'Unassigned'}
      </span>
      <span className="text-sm text-text-secondary">{formatAuditDate(audit.plannedEndAt)}</span>
      <span className={`text-sm ${statusTone(audit.status)}`}>
        {auditStatusLabel[audit.status]}
      </span>
    </button>
  );
}

export function AuditsRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const organizationQuery = useActiveOrganization();
  const organization = organizationQuery.data;
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AuditStatus | 'ALL'>('ALL');
  const [type, setType] = useState<AuditType | 'ALL'>('ALL');
  const [lead, setLead] = useState('');
  const [plannedEndAfter, setPlannedEndAfter] = useState('');
  const [page, setPage] = useState(1);
  const membersQuery = useQuery({
    queryKey: ['audit-members-directory', organization?.id],
    queryFn: () => getOrganizationMembers(organization!.id),
    enabled: Boolean(organization),
    staleTime: 60_000,
  });
  const params: AuditListParams = {
    search,
    ...(status !== 'ALL' ? { status } : {}),
    ...(type !== 'ALL' ? { type } : {}),
    ...(lead ? { leadAuditorMembershipId: lead } : {}),
    ...(plannedEndAfter ? { plannedEndAfter } : {}),
    page,
    pageSize: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  };
  const auditsQuery = useQuery({
    queryKey: ['audits', organization?.id, params],
    queryFn: () => getAudits(organization!.id, params),
    enabled: Boolean(organization),
    placeholderData: (previous) => previous,
  });
  const inProgressQuery = useQuery({
    queryKey: ['audits-active', organization?.id, 'IN_PROGRESS'],
    queryFn: () => getAudits(organization!.id, { status: 'IN_PROGRESS', page: 1, pageSize: 10 }),
    enabled: Boolean(organization),
  });
  const reviewQuery = useQuery({
    queryKey: ['audits-active', organization?.id, 'UNDER_REVIEW'],
    queryFn: () => getAudits(organization!.id, { status: 'UNDER_REVIEW', page: 1, pageSize: 10 }),
    enabled: Boolean(organization),
  });
  const active = [...(inProgressQuery.data?.data ?? []), ...(reviewQuery.data?.data ?? [])];
  const activeFallbackQuery = useQuery({
    queryKey: ['audits-active', organization?.id, 'PLANNED'],
    queryFn: () => getAudits(organization!.id, { status: 'PLANNED', page: 1, pageSize: 10 }),
    enabled:
      Boolean(organization) &&
      !inProgressQuery.isLoading &&
      !reviewQuery.isLoading &&
      active.length === 0,
  });
  if (organizationQuery.isLoading || !organization)
    return (
      <DashboardShell organizationName={organization?.name ?? 'RiskSphere'} title="Audits">
        <div className="py-20 text-center text-sm text-text-muted">Loading your workspace...</div>
      </DashboardShell>
    );
  const activeEngagements = active.length ? active : (activeFallbackQuery.data?.data ?? []);
  return (
    <DashboardShell
      organizationName={organization.name}
      title="Audits"
      description="Plan, execute, and review assurance work across your organization."
      headerActions={
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New Audit
        </Button>
      }
    >
      <div className="space-y-9">
        <ActiveEngagements
          audits={activeEngagements}
          isLoading={
            inProgressQuery.isLoading || reviewQuery.isLoading || activeFallbackQuery.isLoading
          }
          onOpen={(id) => router.push(`/audits/${id}`)}
        />
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
                Engagement records
              </p>
              <h2 className="mt-1 font-heading text-xl text-text-primary">Audit register</h2>
              <p className="mt-1 text-sm text-text-muted">
                Search and review every assurance engagement in this organization.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-text-muted" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search audits..."
                  className="h-9 pl-9"
                />
              </label>
              <MorphNativeSelect
                aria-label="Audit status"
                value={status}
                onChange={(value) => {
                  setStatus(value as AuditStatus | 'ALL');
                  setPage(1);
                }}
              >
                <option value="ALL">Status: All</option>
                {Object.entries(auditStatusLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </MorphNativeSelect>
              <MorphNativeSelect
                aria-label="Audit type"
                value={type}
                onChange={(value) => {
                  setType(value as AuditType | 'ALL');
                  setPage(1);
                }}
              >
                <option value="ALL">Type: All</option>
                {Object.entries(auditTypeLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </MorphNativeSelect>
              <MorphNativeSelect
                aria-label="Lead auditor"
                value={lead}
                onChange={(value) => {
                  setLead(value);
                  setPage(1);
                }}
              >
                <option value="">Lead: All</option>
                {(membersQuery.data?.data ?? []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </MorphNativeSelect>
              <Input
                aria-label="Planned end after"
                type="date"
                value={plannedEndAfter}
                onChange={(event) => {
                  setPlannedEndAfter(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-[150px]"
                title="Planned end after"
              />
            </div>
          </div>
          {auditsQuery.isError ? (
            <p className="border-y border-danger/30 py-10 text-center text-sm text-danger">
              Unable to load audits.
            </p>
          ) : auditsQuery.isLoading ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-bg-card/45">
              <AuditRegisterSkeleton />
            </div>
          ) : auditsQuery.data?.data.length ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-bg-card/45">
              <div className="hidden grid-cols-[minmax(220px,1.5fr)_120px_110px_130px_120px_110px_100px] gap-4 border-b border-border-subtle/70 bg-bg-elevated/25 px-5 py-3 text-[11px] font-medium tracking-[0.08em] text-text-muted md:grid">
                <span>AUDIT</span>
                <span>TYPE</span>
                <span>SCOPE</span>
                <span>PROGRESS</span>
                <span>LEAD</span>
                <span>PLANNED END</span>
                <span>STATUS</span>
              </div>
              {auditsQuery.data.data.map((audit) => (
                <AuditRow
                  key={audit.id}
                  audit={audit}
                  onOpen={() => router.push(`/audits/${audit.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onCreate={() => setCreateOpen(true)} />
          )}
          {auditsQuery.data?.pagination.total ? (
            <div className="flex items-center justify-between text-sm text-text-muted">
              <span>{auditsQuery.data.pagination.total} audits</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>
                <span>
                  {page} / {auditsQuery.data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= auditsQuery.data.pagination.totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
      <NewAuditSheet
        organizationId={organization.id}
        members={membersQuery.data?.data ?? []}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(audit) => {
          void queryClient.invalidateQueries({ queryKey: ['audits'] });
          router.push(`/audits/${audit.id}`);
        }}
      />
    </DashboardShell>
  );
}
