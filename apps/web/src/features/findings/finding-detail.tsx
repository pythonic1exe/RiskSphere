/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';

import { useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMyOrganizations } from '@/features/auth/auth-client';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';
import {
  ActivityTimeline,
  EvidenceSection,
  FindingBadge,
  FindingForm,
  WorkflowDialogs,
} from './finding-ui';
import { useFinding, useFindingValidations, useUpdateFinding } from './finding-hooks';
import { formatFindingDate, humanizeFinding } from './finding-format';
import { TaskFormSheet } from '@/features/tasks/task-sheets';
import { TaskStatusBadge, TaskPriorityBadge } from '@/features/tasks/task-ui';
import { useFindingTasks, useOrganizationMembers } from '@/features/tasks/task-hooks';

function useActiveOrganization() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: getMyOrganizations,
    staleTime: 60_000,
    select: (items) =>
      items.find((item) => item.status === 'ACTIVE' && item.onboarding?.status === 'COMPLETED') ??
      null,
  });
}

export function FindingDetail() {
  const router = useRouter();
  const params = useParams<{ findingId: string }>();
  const organizationQuery = useActiveOrganization();
  const organization = organizationQuery.data;
  const findingQuery = useFinding(organization?.id, params.findingId);
  const taskQuery = useFindingTasks(organization?.id, params.findingId, { page: 1, pageSize: 100 });
  const membersQuery = useOrganizationMembers(organization?.id);
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  if (organizationQuery.isLoading || findingQuery.isLoading || !organization)
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
        Loading Finding...
      </div>
    );
  const finding = findingQuery.data;
  if (!finding)
    return (
      <DashboardShell organizationName={organization.name} title="Findings">
        <div className="py-20 text-center text-sm text-danger">Unable to load this Finding.</div>
      </DashboardShell>
    );
  const canCreateTask =
    (finding.status === 'OPEN' || finding.status === 'IN_REMEDIATION') &&
    organization.roles.some((role) =>
      ['OWNER', 'GRC_ADMIN', 'COMPLIANCE_MANAGER'].includes(role.code),
    );
  return (
    <DashboardShell organizationName={organization.name} title="Findings">
      <div className="space-y-8">
        <button
          type="button"
          onClick={() => router.push('/findings')}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Findings
        </button>
        <div className="flex flex-col gap-5 border-b border-border-subtle/70 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.1em] text-text-muted">
              {finding.findingNumber}
            </p>
            <h1 className="mt-2 max-w-4xl font-heading text-3xl font-medium tracking-[-0.055em] text-text-primary sm:text-4xl">
              {finding.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FindingBadge value={finding.severity} kind="severity" />
              <FindingBadge value={finding.status} kind="status" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              disabled={finding.status === 'CLOSED'}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <WorkflowDialogs
              organizationId={organization.id}
              finding={finding}
              onRefresh={() => void findingQuery.refetch()}
            />
          </div>
        </div>
        <LifecycleRail status={finding.status} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,.8fr)]">
          <main className="space-y-10">
            <AnalysisSection finding={finding} />
            <RemediationSection finding={finding} />
            <FindingTasksSection
              tasks={taskQuery.data?.data ?? []}
              canCreate={canCreateTask}
              onCreate={() => setTaskOpen(true)}
            />
            <EvidenceSection organizationId={organization.id} finding={finding} />
            <ValidationHistory organizationId={organization.id} findingId={finding.id} />
            <ActivityTimeline organizationId={organization.id} findingId={finding.id} />
          </main>
          <aside className="h-fit space-y-5 lg:sticky lg:top-8">
            <Context finding={finding} />
            <Source finding={finding} />
          </aside>
        </div>
        <EditFindingDialog
          organizationId={organization.id}
          finding={finding}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
        <TaskFormSheet
          organizationId={organization.id}
          members={membersQuery.data?.data ?? []}
          findingId={finding.id}
          open={taskOpen}
          onOpenChange={setTaskOpen}
          onSaved={() => void taskQuery.refetch()}
        />
      </div>
    </DashboardShell>
  );
}

function FindingTasksSection({
  tasks,
  canCreate,
  onCreate,
}: {
  tasks: Array<import('@/features/tasks/task-api').Task>;
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <section className="space-y-4 border-t border-border-subtle/70 pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg text-text-primary">Remediation tasks</h2>
          <p className="mt-1 text-sm text-text-muted">Work tracked against this Finding.</p>
        </div>
        {canCreate ? (
          <Button size="sm" variant="outline" onClick={onCreate}>
            Create task
          </Button>
        ) : null}
      </div>
      {tasks.length ? (
        <div className="divide-y divide-border-subtle/70 border-y border-border-subtle/70">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-text-primary">
                  {task.title}
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  {task.assignee?.name ?? 'Unassigned'} ·{' '}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString('en-GB')
                    : 'No due date'}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <TaskPriorityBadge value={task.priority} />
                <TaskStatusBadge value={task.status} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="border-y border-border-subtle/70 py-7 text-sm text-text-muted">
          No remediation tasks have been created.
        </p>
      )}
    </section>
  );
}

function LifecycleRail({ status }: { status: string }) {
  const steps = [
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_REMEDIATION', label: 'Remediation' },
    { key: 'READY_FOR_VALIDATION', label: 'Validation' },
    { key: 'CLOSED', label: 'Closed' },
  ];
  const current = steps.findIndex((step) => step.key === status);
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-y border-border-subtle/70 py-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex min-w-max items-center gap-2">
          <span
            className={`flex size-6 items-center justify-center rounded-full border text-xs ${index <= current ? 'border-primary bg-primary text-white' : 'border-border-default text-text-muted'}`}
          >
            {index + 1}
          </span>
          <span
            className={
              index === current
                ? 'text-sm font-medium text-text-primary'
                : 'text-sm text-text-muted'
            }
          >
            {step.label}
          </span>
          {index < steps.length - 1 ? <span className="mx-2 h-px w-8 bg-border-subtle" /> : null}
        </div>
      ))}
    </div>
  );
}
function AnalysisSection({
  finding,
}: {
  finding: NonNullable<ReturnType<typeof useFinding>['data']>;
}) {
  return (
    <section className="space-y-7">
      <ContentBlock
        title="Description"
        value={finding.description}
        empty="No description documented yet."
      />
      <ContentBlock
        title="Root cause"
        value={finding.rootCause}
        empty="No root cause documented yet."
      />
      <ContentBlock title="Impact" value={finding.impact} empty="No impact documented yet." />
      <ContentBlock
        title="Recommendation"
        value={finding.recommendation}
        empty="No recommendation documented yet."
      />
    </section>
  );
}
function ContentBlock({
  title,
  value,
  empty,
}: {
  title: string;
  value: string | null;
  empty: string;
}) {
  return (
    <section className="space-y-2">
      <h2 className="font-heading text-lg text-text-primary">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">{value || empty}</p>
    </section>
  );
}
function RemediationSection({
  finding,
}: {
  finding: NonNullable<ReturnType<typeof useFinding>['data']>;
}) {
  return (
    <section className="space-y-4 border-t border-border-subtle/70 pt-7">
      <h2 className="font-heading text-lg text-text-primary">Remediation</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Owner</p>
          <p className="mt-1 text-sm text-text-primary">{finding.owner?.name ?? 'Unassigned'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Due date</p>
          <p className={`mt-1 text-sm ${finding.isOverdue ? 'text-danger' : 'text-text-primary'}`}>
            {finding.isOverdue
              ? `${formatFindingDate(finding.dueDate)} · ${finding.daysOverdue} days overdue`
              : formatFindingDate(finding.dueDate)}
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Plan</p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
          {finding.remediationPlan || 'No remediation plan has been started.'}
        </p>
      </div>
    </section>
  );
}
function Context({ finding }: { finding: NonNullable<ReturnType<typeof useFinding>['data']> }) {
  return (
    <section className="space-y-4 rounded-xl border border-border-subtle/70 bg-bg-card/35 p-5">
      <h2 className="font-heading text-lg text-text-primary">Context</h2>
      <div className="space-y-3 text-sm">
        <p>
          <span className="text-text-muted">Owner</span>
          <span className="mt-1 block text-text-primary">
            {finding.owner?.name ?? 'Unassigned'}
          </span>
        </p>
        <p>
          <span className="text-text-muted">Severity</span>
          <span className="mt-1 block">
            <FindingBadge value={finding.severity} kind="severity" />
          </span>
        </p>
        <p>
          <span className="text-text-muted">Created</span>
          <span className="mt-1 block text-text-primary">
            {formatFindingDate(finding.createdAt)}
          </span>
        </p>
        <p>
          <span className="text-text-muted">Updated</span>
          <span className="mt-1 block text-text-primary">
            {formatFindingDate(finding.updatedAt)}
          </span>
        </p>
      </div>
    </section>
  );
}
function Source({ finding }: { finding: NonNullable<ReturnType<typeof useFinding>['data']> }) {
  return (
    <section className="space-y-4 border-t border-border-subtle/70 pt-5">
      <h2 className="font-heading text-lg text-text-primary">Source</h2>
      {finding.sourceType === 'MANUAL' ? (
        <p className="text-sm text-text-secondary">Manual</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-text-primary">
            {finding.source.audit?.title}
            <span className="mt-1 block text-text-muted">{finding.source.audit?.code}</span>
          </p>
          <p className="text-text-primary">
            {finding.source.auditTest?.title}
            <span className="mt-1 block text-text-muted">{finding.source.auditTest?.code}</span>
          </p>
          <p className="whitespace-pre-wrap text-text-secondary">
            {finding.source.observation?.content}
          </p>
        </div>
      )}
      {finding.sourceType !== 'MANUAL' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.location.assign(
              `/audits/${finding.source.audit?.id}/tests/${finding.source.auditTest?.id}`,
            )
          }
        >
          Open Audit Test <ArrowLeft className="size-4 rotate-180" />
        </Button>
      ) : null}
    </section>
  );
}
function ValidationHistory({
  organizationId,
  findingId,
}: {
  organizationId: string;
  findingId: string;
}) {
  const query = useFindingValidations(organizationId, findingId);
  return (
    <section className="space-y-4 border-t border-border-subtle/70 pt-7">
      <h2 className="font-heading text-lg text-text-primary">Validation history</h2>
      {query.data?.data?.length ? (
        <div className="space-y-4">
          {query.data.data.map((item) => (
            <div key={item.id} className="border-l-2 border-primary/50 pl-4">
              <p className="text-sm font-medium text-text-primary">
                {humanizeFinding(item.decision)} by{' '}
                {item.reviewerMembership?.user?.email ?? 'Reviewer'}
              </p>
              <p className="mt-1 text-xs text-text-muted">{formatFindingDate(item.createdAt)}</p>
              {item.notes ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{item.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No validation cycles recorded yet.</p>
      )}
    </section>
  );
}
function EditFindingDialog({
  organizationId,
  finding,
  open,
  onOpenChange,
}: {
  organizationId: string;
  finding: NonNullable<ReturnType<typeof useFinding>['data']>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdateFinding(organizationId, finding.id);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border-default bg-bg-elevated text-text-primary sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Finding</DialogTitle>
          <DialogDescription>Update metadata and remediation fields.</DialogDescription>
        </DialogHeader>
        <FindingForm
          organizationId={organizationId}
          initial={{
            title: finding.title,
            severity: finding.severity,
            description: finding.description ?? '',
            ownerMembershipId: finding.ownerMembershipId,
            dueDate: finding.dueDate ?? '',
            impact: finding.impact ?? '',
            recommendation: finding.recommendation ?? '',
            rootCause: finding.rootCause ?? '',
            remediationPlan: finding.remediationPlan ?? '',
          }}
          submitLabel="Save changes"
          busy={mutation.isPending}
          error={mutation.error}
          onSubmit={(values) =>
            mutation.mutate(
              {
                title: values.title,
                severity: values.severity,
                description: values.description,
                ownerMembershipId: values.ownerMembershipId,
                dueDate: values.dueDate
                  ? new Date(`${values.dueDate}T00:00:00.000Z`).toISOString()
                  : null,
                impact: values.impact || null,
                recommendation: values.recommendation || null,
                rootCause: values.rootCause || null,
                remediationPlan: values.remediationPlan || null,
              },
              { onSuccess: () => onOpenChange(false) },
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
