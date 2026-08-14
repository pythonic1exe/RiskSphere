'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MorphNativeSelect } from '@/components/ui/morph-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMyOrganizations } from '@/features/auth/auth-client';
import { getControls } from '@/features/controls/control-api';
import { getComplianceFrameworks } from '@/features/compliance/compliance-api';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';
import {
  completeAudit,
  getAudit,
  getAuditMembers,
  getAuditScope,
  getAuditTests,
  getOrganizationMembers,
  planAudit,
  removeAuditMember,
  removeAuditScope,
  updateAuditMember,
  startAudit,
  submitAuditForReview,
  type Audit,
  type AuditMember,
  type AuditStatus,
  type OrganizationMember,
} from './audit-api';
import {
  auditMemberRoleLabel,
  auditStatusLabel,
  auditTypeLabel,
  formatAuditDate,
  formatAuditDateRange,
  statusTone,
} from './audit-format';
import { AuditDetailSkeleton } from './audit-loading';
import {
  AddMemberDialog,
  AddScopeDialog,
  CancelAuditDialog,
  NewAuditSheet,
  NewAuditTestSheet,
} from './audit-sheets';

function useOrganization() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    select: (items) =>
      items.find((item) => item.status === 'ACTIVE' && item.onboarding?.status === 'COMPLETED') ??
      null,
  });
}
function lifecycleAction(status: AuditStatus) {
  return status === 'DRAFT'
    ? (['Plan Audit', planAudit] as const)
    : status === 'PLANNED'
      ? (['Start Audit', startAudit] as const)
      : status === 'IN_PROGRESS'
        ? (['Submit for Review', submitAuditForReview] as const)
        : status === 'UNDER_REVIEW'
          ? (['Complete Audit', completeAudit] as const)
          : null;
}
function Lifecycle({ status }: { status: AuditStatus }) {
  const steps: AuditStatus[] = ['DRAFT', 'PLANNED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
      {steps.map((step, index) => (
        <span key={step} className="flex items-center gap-2">
          <span
            className={
              step === status
                ? 'font-medium text-primary'
                : steps.indexOf(status) > index
                  ? 'text-text-secondary'
                  : ''
            }
          >
            {auditStatusLabel[step]}
          </span>
          {index < steps.length - 1 ? <span className="text-text-disabled">—</span> : null}
        </span>
      ))}
    </div>
  );
}
function Progress({ audit }: { audit: Audit }) {
  return (
    <section className="border-y border-border-subtle/70 py-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Audit progress</p>
          <p className="mt-1 text-sm text-text-muted">
            {audit.testSummary.completed} of {audit.testSummary.total} tests complete
          </p>
        </div>
        <span className="font-heading text-2xl text-text-primary">
          {audit.testSummary.completionPercent}%
        </span>
      </div>
      <div className="mt-4 h-1.5 bg-bg-elevated">
        <div
          className="h-1.5 bg-primary"
          style={{ width: `${audit.testSummary.completionPercent}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-text-muted">{audit.testSummary.pending} remaining</p>
    </section>
  );
}
function ResultSummary({ audit }: { audit: Audit }) {
  const items = [
    ['Pass', audit.testSummary.pass, 'bg-success'],
    ['Exception', audit.testSummary.exception, 'bg-warning'],
    ['Fail', audit.testSummary.fail, 'bg-danger'],
    ['Not applicable', audit.testSummary.notApplicable, 'bg-text-muted'],
    ['Pending', audit.testSummary.pending, 'bg-bg-elevated'],
  ] as const;
  return (
    <section>
      <h3 className="font-heading text-lg text-text-primary">Test results</h3>
      <div className="mt-4 space-y-3">
        {items.map(([label, value, color]) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span className="w-28 text-text-secondary">{label}</span>
            <span className="h-1.5 flex-1 bg-bg-elevated">
              <span
                className={`block h-full ${color}`}
                style={{
                  width: audit.testSummary.total
                    ? `${Math.max((value / audit.testSummary.total) * 100, value ? 3 : 0)}%`
                    : '0%',
                }}
              />
            </span>
            <span className="w-6 text-right text-text-muted">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function AuditDetails({ audit }: { audit: Audit }) {
  const rows = [
    ['Type', auditTypeLabel[audit.type]],
    ['Status', auditStatusLabel[audit.status]],
    ['Lead auditor', audit.leadAuditor?.name ?? 'Unassigned'],
    ['Planned start', formatAuditDate(audit.plannedStartAt)],
    ['Planned end', formatAuditDate(audit.plannedEndAt)],
    ['Started', formatAuditDate(audit.startedAt)],
    ['Completed', formatAuditDate(audit.completedAt)],
  ];
  return (
    <section>
      <h3 className="font-heading text-lg text-text-primary">Audit details</h3>
      <dl className="mt-4 divide-y divide-border-subtle/60 border-y border-border-subtle/70">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-2 gap-4 py-3 text-sm">
            <dt className="text-text-muted">{label}</dt>
            <dd className="text-text-secondary">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
function Overview({
  audit,
  onScope,
  onTeam,
}: {
  audit: Audit;
  onScope: () => void;
  onTeam: () => void;
}) {
  const scopes = audit.scopes ?? [];
  const members = audit.members ?? [];
  const frameworkCount = scopes.filter((item) => item.type === 'FRAMEWORK').length;
  const requirementCount = scopes.filter((item) => item.type === 'REQUIREMENT').length;
  const controlCount = scopes.filter((item) => item.type === 'CONTROL').length;
  return (
    <div className="space-y-8">
      <Progress audit={audit} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,.9fr)]">
        <ResultSummary audit={audit} />
        <AuditDetails audit={audit} />
      </div>
      {audit.description ? (
        <section className="border-t border-border-subtle/70 pt-7">
          <h3 className="font-heading text-lg text-text-primary">Description</h3>
          <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-text-secondary">
            {audit.description}
          </p>
        </section>
      ) : null}
      <div className="grid gap-8 border-t border-border-subtle/70 pt-7 md:grid-cols-2">
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg text-text-primary">Scope</h3>
            <button
              type="button"
              onClick={onScope}
              className="text-sm text-primary hover:underline"
            >
              View scope <ArrowRight className="ml-1 inline size-3" />
            </button>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            {frameworkCount} Frameworks · {requirementCount} Requirements · {controlCount} Controls
          </p>
        </section>
        <section>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-lg text-text-primary">Team</h3>
            <button type="button" onClick={onTeam} className="text-sm text-primary hover:underline">
              View team <ArrowRight className="ml-1 inline size-3" />
            </button>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {members.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span className="text-text-secondary">{item.member?.name ?? 'Unknown member'}</span>
                <span className="text-text-muted">{auditMemberRoleLabel[item.role]}</span>
              </div>
            ))}
            {!members.length ? <p className="text-text-muted">No team members assigned.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
function ScopeTab({
  audit,
  organizationId,
  onRefresh,
}: {
  audit: Audit;
  organizationId: string;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const scopeQuery = useQuery({
    queryKey: ['audit-scope', organizationId, audit.id],
    queryFn: () => getAuditScope(organizationId, audit.id),
  });
  const controlsQuery = useQuery({
    queryKey: ['audit-scope-controls', organizationId],
    queryFn: () => getControls(organizationId, { page: 1, pageSize: 100, status: 'ALL' }),
  });
  const frameworksQuery = useQuery({
    queryKey: ['audit-scope-frameworks', organizationId],
    queryFn: () =>
      getComplianceFrameworks(organizationId, { page: 1, pageSize: 100, status: 'ACTIVE' }),
  });
  const scopes = scopeQuery.data?.data ?? audit.scopes ?? [];
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['audit-scope', organizationId, audit.id] });
    onRefresh();
  };
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-text-primary">Audit Scope</h3>
          <p className="mt-1 text-sm text-text-muted">
            The frameworks, requirements, and controls covered by this engagement.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={audit.status === 'COMPLETED' || audit.status === 'CANCELLED'}
        >
          <Plus className="size-4" />
          Add scope
        </Button>
      </div>
      {(['FRAMEWORK', 'REQUIREMENT', 'CONTROL'] as const).map((type) => (
        <div key={type}>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
            {type === 'FRAMEWORK'
              ? 'Frameworks'
              : type === 'REQUIREMENT'
                ? 'Requirements'
                : 'Controls'}
          </p>
          <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
            {scopes
              .filter((item) => item.type === type)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block text-sm font-medium text-text-primary">
                      {item.framework?.name ??
                        item.requirement?.code ??
                        item.control?.code ??
                        'Scope item'}
                    </span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {item.framework?.version ??
                        item.requirement?.title ??
                        item.control?.title ??
                        ''}
                    </span>
                  </span>
                  {audit.status !== 'COMPLETED' && audit.status !== 'CANCELLED' ? (
                    <button
                      type="button"
                      aria-label="Remove scope"
                      className="text-text-muted hover:text-danger"
                      onClick={() => {
                        void removeAuditScope(organizationId, audit.id, item.id).then(refresh);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            {!scopes.some((item) => item.type === type) ? (
              <p className="py-4 text-sm text-text-muted">No {type.toLowerCase()} scope defined.</p>
            ) : null}
          </div>
        </div>
      ))}
      <AddScopeDialog
        organizationId={organizationId}
        auditId={audit.id}
        open={open}
        onOpenChange={setOpen}
        onSaved={refresh}
        controls={(controlsQuery.data?.data ?? []).map((item) => ({
          id: item.id,
          code: item.code,
          title: item.title,
        }))}
        requirements={scopes
          .filter((item) => item.requirement)
          .map((item) => ({
            id: item.requirement!.id,
            code: item.requirement!.code,
            title: item.requirement!.title,
          }))}
        frameworks={(frameworksQuery.data?.data ?? []).map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
        }))}
      />
    </section>
  );
}
function TeamTab({
  audit,
  organizationId,
  members,
  onRefresh,
}: {
  audit: Audit;
  organizationId: string;
  members: OrganizationMember[];
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const membersQuery = useQuery({
    queryKey: ['audit-team', organizationId, audit.id],
    queryFn: () => getAuditMembers(organizationId, audit.id),
  });
  const existing = membersQuery.data?.data ?? audit.members ?? [];
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['audit-team', organizationId, audit.id] });
    onRefresh();
  };
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-text-primary">Audit Team</h3>
          <p className="mt-1 text-sm text-text-muted">
            Engagement-specific responsibilities, separate from organization RBAC.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={audit.status === 'COMPLETED' || audit.status === 'CANCELLED'}
        >
          <Plus className="size-4" />
          Add member
        </Button>
      </div>
      <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
        {existing.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 py-4">
            <span>
              <span className="block text-sm font-medium text-text-primary">
                {item.member?.name ?? 'Unknown member'}
              </span>
              <span className="mt-1 block text-xs text-text-muted">
                {audit.status !== 'COMPLETED' && audit.status !== 'CANCELLED' ? (
                  <MorphNativeSelect
                    aria-label={`Role for ${item.member?.name ?? 'member'}`}
                    value={item.role}
                    onChange={(value) => {
                      void updateAuditMember(
                        organizationId,
                        audit.id,
                        item.id,
                        value as AuditMember['role'],
                      ).then(refresh);
                    }}
                    className="mt-1 h-8 text-xs"
                  >
                    {Object.entries(auditMemberRoleLabel).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </MorphNativeSelect>
                ) : (
                  auditMemberRoleLabel[item.role]
                )}
              </span>
            </span>
            {audit.status !== 'COMPLETED' && audit.status !== 'CANCELLED' ? (
              <button
                type="button"
                aria-label="Remove member"
                className="text-text-muted hover:text-danger"
                onClick={() => {
                  void removeAuditMember(organizationId, audit.id, item.id).then(refresh);
                }}
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
        ))}
        {!existing.length ? (
          <p className="py-6 text-sm text-text-muted">No team members assigned.</p>
        ) : null}
      </div>
      <AddMemberDialog
        organizationId={organizationId}
        auditId={audit.id}
        members={members}
        existingIds={new Set(existing.map((item) => item.membershipId))}
        open={open}
        onOpenChange={setOpen}
        onSaved={refresh}
      />
    </section>
  );
}

export function AuditDetail() {
  const router = useRouter();
  const params = useParams<{ auditId: string }>();
  const organizationQuery = useOrganization();
  const organization = organizationQuery.data;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const auditQuery = useQuery({
    queryKey: ['audit', organization?.id, params.auditId],
    queryFn: () => getAudit(organization!.id, params.auditId),
    enabled: Boolean(organization && params.auditId),
  });
  const membersQuery = useQuery({
    queryKey: ['audit-members-directory', organization?.id],
    queryFn: () => getOrganizationMembers(organization!.id),
    enabled: Boolean(organization),
    staleTime: 60_000,
  });
  if (organizationQuery.isLoading || auditQuery.isLoading || !organization)
    return (
      <DashboardShell organizationName={organization?.name ?? 'RiskSphere'} title="Audits">
        <AuditDetailSkeleton />
      </DashboardShell>
    );
  const activeOrganization = organization;
  const loadedAudit = auditQuery.data;
  if (!loadedAudit)
    return (
      <DashboardShell organizationName={activeOrganization.name} title="Audits">
        <p className="py-20 text-center text-sm text-danger">Unable to load this audit.</p>
      </DashboardShell>
    );
  const audit = loadedAudit;
  const action = lifecycleAction(audit.status);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['audit', activeOrganization.id, audit.id] });
    void queryClient.invalidateQueries({ queryKey: ['audits'] });
    void queryClient.invalidateQueries({ queryKey: ['audits-active'] });
  };
  async function runLifecycle() {
    if (!action) return;
    await action[1](activeOrganization.id, audit.id);
    refresh();
  }
  return (
    <DashboardShell organizationName={activeOrganization.name} title="Audits">
      <div className="space-y-7">
        <button
          type="button"
          onClick={() => router.push('/audits')}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Audits
        </button>
        <header className="space-y-5 border-b border-border-subtle/70 pb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.1em] text-text-muted">{audit.code}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-3xl font-medium tracking-[-0.05em] text-text-primary sm:text-4xl">
                  {audit.title}
                </h1>
                <span className={`text-sm ${statusTone(audit.status)}`}>
                  {auditStatusLabel[audit.status]}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-sm text-text-secondary">
                {audit.description ?? 'Assurance engagement workspace.'}
              </p>
              <p className="mt-3 text-sm text-text-muted">
                {auditTypeLabel[audit.type]} ·{' '}
                {formatAuditDateRange(audit.plannedStartAt, audit.plannedEndAt)} ·{' '}
                {audit.leadAuditor?.name ?? 'No lead auditor'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {action ? <Button onClick={() => void runLifecycle()}>{action[0]}</Button> : null}
              {audit.status !== 'COMPLETED' && audit.status !== 'CANCELLED' ? (
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
              ) : null}
              {action && audit.status !== 'COMPLETED' && audit.status !== 'CANCELLED' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancel audit"
                  onClick={() => setCancelOpen(true)}
                >
                  <MoreHorizontal className="size-5" />
                </Button>
              ) : null}
            </div>
          </div>
          <Lifecycle status={audit.status} />
          {audit.status === 'CANCELLED' ? (
            <p className="text-sm text-danger">
              This audit was cancelled. Historical records remain available.
            </p>
          ) : null}
        </header>
        <Tabs value={tab} onValueChange={setTab} className="space-y-7">
          <TabsList
            variant="line"
            className="w-full justify-start gap-6 overflow-x-auto border-b border-border-subtle/70"
          >
            <TabsTrigger value="overview" className="flex-none px-0 pb-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex-none px-0 pb-3">
              Tests <span className="ml-1 text-text-muted">{audit.counts.tests}</span>
            </TabsTrigger>
            <TabsTrigger value="scope" className="flex-none px-0 pb-3">
              Scope <span className="ml-1 text-text-muted">{audit.counts.scopes}</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-none px-0 pb-3">
              Team <span className="ml-1 text-text-muted">{audit.counts.members}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview audit={audit} onScope={() => setTab('scope')} onTeam={() => setTab('team')} />
          </TabsContent>
          <TabsContent value="tests">
            <TestsPreview
              audit={audit}
              organizationId={activeOrganization.id}
              members={membersQuery.data?.data ?? []}
              onOpen={(testId) => router.push(`/audits/${audit.id}/tests/${testId}`)}
            />
          </TabsContent>
          <TabsContent value="scope">
            <ScopeTab audit={audit} organizationId={activeOrganization.id} onRefresh={refresh} />
          </TabsContent>
          <TabsContent value="team">
            <TeamTab
              audit={audit}
              organizationId={activeOrganization.id}
              members={membersQuery.data?.data ?? []}
              onRefresh={refresh}
            />
          </TabsContent>
        </Tabs>
        <CancelAuditDialog
          organizationId={activeOrganization.id}
          auditId={audit.id}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
          onCancelled={refresh}
        />
        <NewAuditSheet
          organizationId={activeOrganization.id}
          members={membersQuery.data?.data ?? []}
          audit={audit}
          open={editOpen}
          onOpenChange={setEditOpen}
          onCreated={refresh}
        />
      </div>
    </DashboardShell>
  );
}
function TestsPreview({
  audit,
  organizationId,
  members,
  onOpen,
}: {
  audit: Audit;
  organizationId: string;
  members: OrganizationMember[];
  onOpen: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const testsQuery = useQuery({
    queryKey: ['audit-tests', organizationId, audit.id, { search, status, page }],
    queryFn: () =>
      getAuditTests(organizationId, audit.id, {
        search,
        ...(status !== 'ALL' ? { status: status as never } : {}),
        page,
        pageSize: 10,
      }),
  });
  const tests = testsQuery.data?.data ?? audit.tests ?? [];
  const controls = (audit.scopes ?? [])
    .filter((item) => item.control)
    .map((item) => ({
      id: item.control!.id,
      code: item.control!.code,
      title: item.control!.title,
    }));
  const requirements = (audit.scopes ?? [])
    .filter((item) => item.requirement)
    .map((item) => ({
      id: item.requirement!.id,
      code: item.requirement!.code,
      title: item.requirement!.title,
    }));
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-heading text-xl text-text-primary">Audit Tests</h3>
          <p className="mt-1 text-sm text-text-muted">
            The operational workpapers used to evaluate this engagement.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={audit.status === 'COMPLETED' || audit.status === 'CANCELLED'}
        >
          <Plus className="size-4" />
          New Test
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search tests..."
          className="h-9 min-w-[220px]"
        />
        <MorphNativeSelect
          aria-label="Test status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <option value="ALL">Status: All</option>
          <option value="NOT_STARTED">Not started</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="READY_FOR_REVIEW">Ready for review</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
        </MorphNativeSelect>
      </div>
      {tests.length ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          {tests.map((test) => (
            <button
              type="button"
              key={test.id}
              onClick={() => onOpen(test.id)}
              className="group flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-bg-hover/30"
            >
              <span>
                <span className="block text-xs text-text-muted">{test.code}</span>
                <span className="mt-1 block text-sm font-medium text-text-primary">
                  {test.title}
                </span>
              </span>
              <span className="flex items-center gap-4 text-sm">
                <span className={statusTone(test.status)}>{test.status.replaceAll('_', ' ')}</span>
                <ArrowRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-12 text-sm text-text-muted">
          No audit tests have been created yet.
        </p>
      )}
      <NewAuditTestSheet
        organizationId={organizationId}
        auditId={audit.id}
        members={members}
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          void queryClient.invalidateQueries({
            queryKey: ['audit-tests', organizationId, audit.id],
          });
          void queryClient.invalidateQueries({ queryKey: ['audit', organizationId, audit.id] });
        }}
        controls={controls}
        requirements={requirements}
      />
    </section>
  );
}
