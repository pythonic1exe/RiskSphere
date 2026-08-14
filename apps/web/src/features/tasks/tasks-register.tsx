/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getMyOrganizations } from '@/features/auth/auth-client';
import { DashboardShell } from '@/features/dashboard/dashboard-shell';
import { TaskDetailSheet, TaskFormSheet } from './task-sheets';
import {
  TaskPagination,
  TasksEmpty,
  TasksSkeleton,
  TaskSummaryStrip,
  TaskToolbar,
  TasksTable,
} from './task-ui';
import {
  useOrganizationMembers,
  useTaskDueSoonCount,
  useTaskSummary,
  useTasks,
} from './task-hooks';
import type { TaskListParams, TaskPriority, TaskSourceType, TaskStatus } from './task-api';

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
const managerRoles = new Set(['OWNER', 'GRC_ADMIN', 'COMPLIANCE_MANAGER']);

export function TasksRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationQuery = useActiveOrganization();
  const organization = organizationQuery.data;
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'ALL');
  const [priority, setPriority] = useState(searchParams.get('priority') ?? 'ALL');
  const [assignee, setAssignee] = useState(searchParams.get('assigneeMembershipId') ?? 'ALL');
  const [source, setSource] = useState(searchParams.get('sourceType') ?? 'ALL');
  const [myTasks, setMyTasks] = useState(searchParams.get('assignedToMe') === 'true');
  const [overdue, setOverdue] = useState(searchParams.get('overdue') === 'true');
  const [dueSoon, setDueSoon] = useState(searchParams.get('dueSoon') === 'true');
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'updatedAt:desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<import('./task-api').Task | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => globalThis.clearTimeout(timer);
  }, [searchInput]);
  const [sortBy, sortOrder] = sort.split(':') as [
    NonNullable<TaskListParams['sortBy']>,
    'asc' | 'desc',
  ];
  const dueSoonFrom = new Date();
  const dueSoonTo = new Date(dueSoonFrom.getTime() + 7 * 86400000);
  const params: TaskListParams = useMemo(
    () => ({
      page,
      pageSize: 10,
      ...(search ? { search } : {}),
      ...(status !== 'ALL' ? { status: status as TaskStatus } : {}),
      ...(priority !== 'ALL' ? { priority: priority as TaskPriority } : {}),
      ...(assignee !== 'ALL' ? { assigneeMembershipId: assignee } : {}),
      ...(source !== 'ALL' ? { sourceType: source as TaskSourceType } : {}),
      ...(myTasks ? { assignedToMe: true } : {}),
      ...(overdue ? { overdue: true } : {}),
      ...(dueSoon
        ? { dueAfter: dueSoonFrom.toISOString(), dueBefore: dueSoonTo.toISOString() }
        : {}),
      sortBy,
      sortOrder,
    }),
    [
      assignee,
      dueSoon,
      myTasks,
      overdue,
      page,
      priority,
      search,
      sortBy,
      sortOrder,
      source,
      status,
    ],
  );
  const membersQuery = useOrganizationMembers(organization?.id);
  const tasksQuery = useTasks(organization?.id, params);
  const summaryQuery = useTaskSummary(organization?.id);
  const dueSoonQuery = useTaskDueSoonCount(organization?.id);
  const canManage = Boolean(organization?.roles.some((role) => managerRoles.has(role.code)));
  const members = membersQuery.data?.data ?? [];
  useEffect(() => {
    const query = new globalThis.URLSearchParams();
    if (search) query.set('search', search);
    if (status !== 'ALL') query.set('status', status);
    if (priority !== 'ALL') query.set('priority', priority);
    if (assignee !== 'ALL') query.set('assigneeMembershipId', assignee);
    if (source !== 'ALL') query.set('sourceType', source);
    if (myTasks) query.set('assignedToMe', 'true');
    if (overdue) query.set('overdue', 'true');
    if (dueSoon) query.set('dueSoon', 'true');
    if (sort !== 'updatedAt:desc') query.set('sort', sort);
    if (page > 1) query.set('page', String(page));
    router.replace(`/tasks${query.size ? `?${query.toString()}` : ''}`, { scroll: false });
  }, [assignee, dueSoon, myTasks, overdue, page, priority, router, search, sort, source, status]);
  const clear = () => {
    setSearchInput('');
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
    setAssignee('ALL');
    setSource('ALL');
    setMyTasks(false);
    setOverdue(false);
    setDueSoon(false);
    setSort('updatedAt:desc');
    setPage(1);
  };
  const hasFilters = Boolean(
    search ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    assignee !== 'ALL' ||
    source !== 'ALL' ||
    myTasks ||
    overdue ||
    dueSoon,
  );
  if (organizationQuery.isLoading || !organization)
    return (
      <DashboardShell organizationName={organization?.name ?? 'RiskSphere'} title="Tasks">
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-muted">
          Loading your workspace...
        </div>
      </DashboardShell>
    );
  return (
    <DashboardShell
      organizationName={organization.name}
      title="Tasks"
      description="Track remediation work, ownership, deadlines, and completion."
      headerActions={
        canManage ? (
          <Button
            onClick={() => {
              setEditTask(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Task
          </Button>
        ) : null
      }
    >
      <div className="space-y-7">
        <TaskSummaryStrip
          summary={summaryQuery.data}
          dueSoon={dueSoonQuery.data}
          onOverdue={() => {
            setOverdue(true);
            setDueSoon(false);
            setPage(1);
          }}
          onDueSoon={() => {
            setOverdue(false);
            setDueSoon(true);
            setPage(1);
          }}
        />
        <TaskToolbar
          search={searchInput}
          onSearch={setSearchInput}
          status={status}
          onStatus={(value) => {
            setStatus(value);
            setPage(1);
          }}
          priority={priority}
          onPriority={(value) => {
            setPriority(value);
            setPage(1);
          }}
          assignee={assignee}
          onAssignee={(value) => {
            setAssignee(value);
            setPage(1);
          }}
          source={source}
          onSource={(value) => {
            setSource(value);
            setPage(1);
          }}
          members={members}
          myTasks={myTasks}
          onMyTasks={(value) => {
            setMyTasks(value);
            setPage(1);
          }}
          hasFilters={hasFilters}
          onClear={clear}
          sort={sort}
          onSort={(value) => {
            setSort(value);
            setPage(1);
          }}
        />
        <section className="space-y-4">
          {tasksQuery.isError ? (
            <div className="rounded-xl border border-danger/30 bg-danger-muted/20 p-5 text-sm text-danger">
              Unable to load Tasks.{' '}
              <button type="button" className="underline" onClick={() => void tasksQuery.refetch()}>
                Retry
              </button>
            </div>
          ) : tasksQuery.isLoading ? (
            <div className="overflow-hidden rounded-2xl border border-border-subtle/70 bg-bg-card/45">
              <TasksSkeleton />
            </div>
          ) : tasksQuery.data?.data.length ? (
            <TasksTable tasks={tasksQuery.data.data} onOpen={setSelectedId} />
          ) : (
            <TasksEmpty
              filtered={hasFilters}
              myTasks={myTasks}
              onClear={clear}
              onCreate={() => setFormOpen(true)}
            />
          )}
        </section>
        <TaskPagination pagination={tasksQuery.data?.pagination} onPage={setPage} />
        <TaskFormSheet
          organizationId={organization.id}
          members={members}
          open={formOpen}
          initialTask={editTask}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditTask(null);
          }}
          onSaved={(task) => setSelectedId(task.id)}
        />
        <TaskDetailSheet
          organizationId={organization.id}
          taskId={selectedId}
          open={Boolean(selectedId)}
          membershipId={organization.membershipId}
          canManage={canManage}
          onOpenChange={(open) => !open && setSelectedId(null)}
          onEdit={(task) => {
            setSelectedId(null);
            setEditTask(task);
            setFormOpen(true);
          }}
          onRefresh={() => {
            void tasksQuery.refetch();
          }}
        />
      </div>
    </DashboardShell>
  );
}
