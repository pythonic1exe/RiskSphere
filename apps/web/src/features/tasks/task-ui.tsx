'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MorphNativeSelect } from '@/components/ui/morph-select';
import type { OrganizationMember, Task, TaskPriority, TaskStatus, TaskSummary } from './task-api';
import {
  formatTaskDate,
  formatTaskRelativeDate,
  taskPriorityLabel,
  taskSourceLabel,
  taskStatusLabel,
} from './task-format';

export function TaskStatusBadge({ value }: { value: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${value === 'DONE' ? 'border-success/30 bg-success-muted/20 text-success' : value === 'BLOCKED' || value === 'CANCELLED' ? 'border-danger/30 bg-danger-muted/20 text-danger' : value === 'IN_PROGRESS' ? 'border-primary/30 bg-primary-muted/20 text-primary' : 'border-border-subtle text-text-secondary'}`}
    >
      {taskStatusLabel[value]}
    </span>
  );
}
export function TaskPriorityBadge({ value }: { value: TaskPriority }) {
  return (
    <span
      className={`text-xs ${value === 'CRITICAL' ? 'font-medium text-danger' : value === 'HIGH' ? 'text-warning' : 'text-text-secondary'}`}
    >
      {taskPriorityLabel[value]}
    </span>
  );
}
export function TaskAssignee({ task }: { task: Task }) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm text-text-secondary">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-muted text-[10px] font-medium text-primary">
        {(task.assignee?.name ?? 'U').slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate">{task.assignee?.name ?? 'Unassigned'}</span>
    </span>
  );
}
export function TaskSummaryStrip({
  summary,
  dueSoon,
  onOverdue,
  onDueSoon,
}: {
  summary: TaskSummary | undefined;
  dueSoon: number | undefined;
  onOverdue: () => void;
  onDueSoon: () => void;
}) {
  const metrics = [
    { label: 'Open', value: summary?.todo ?? 0, tone: '' },
    { label: 'In progress', value: summary?.inProgress ?? 0, tone: 'text-primary' },
    { label: 'Due soon', value: dueSoon ?? 0, tone: 'text-warning', action: onDueSoon },
    { label: 'Overdue', value: summary?.overdue ?? 0, tone: 'text-danger', action: onOverdue },
    { label: 'Completed', value: summary?.done ?? 0, tone: 'text-success' },
  ];
  return (
    <section
      aria-label="Task operations"
      className="grid grid-cols-2 divide-x divide-y divide-border-subtle/70 rounded-2xl border border-border-subtle/70 bg-bg-card/55 sm:grid-cols-5 sm:divide-y-0"
    >
      {metrics.map((metric) => (
        <button
          key={metric.label}
          type="button"
          onClick={metric.action}
          className="px-4 py-4 text-left transition-colors hover:bg-bg-hover/45 sm:px-5"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
            {metric.label}
          </p>
          <p className={`mt-1 font-heading text-2xl ${metric.tone || 'text-text-primary'}`}>
            {metric.value}
          </p>
        </button>
      ))}
    </section>
  );
}
export function TaskToolbar({
  search,
  onSearch,
  status,
  onStatus,
  priority,
  onPriority,
  assignee,
  onAssignee,
  source,
  onSource,
  members,
  myTasks,
  onMyTasks,
  hasFilters,
  onClear,
  onSort,
  sort,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  priority: string;
  onPriority: (value: string) => void;
  assignee: string;
  onAssignee: (value: string) => void;
  source: string;
  onSource: (value: string) => void;
  members: OrganizationMember[];
  myTasks: boolean;
  onMyTasks: (value: boolean) => void;
  hasFilters: boolean;
  onClear: () => void;
  onSort: (value: string) => void;
  sort: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 border-b border-border-subtle/70">
        <button
          type="button"
          onClick={() => onMyTasks(false)}
          className={`border-b-2 px-1 pb-3 text-sm ${!myTasks ? 'border-primary text-text-primary' : 'border-transparent text-text-muted'}`}
        >
          All tasks
        </button>
        <button
          type="button"
          onClick={() => onMyTasks(true)}
          className={`border-b-2 px-1 pb-3 text-sm ${myTasks ? 'border-primary text-text-primary' : 'border-transparent text-text-muted'}`}
        >
          My tasks
        </button>
      </div>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative min-w-[220px] flex-1 lg:max-w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-text-muted" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search tasks..."
            className="h-9 pl-9"
          />
        </label>
        <MorphNativeSelect aria-label="Status" value={status} onChange={onStatus}>
          <option value="ALL">Status</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DONE">Done</option>
          <option value="CANCELLED">Cancelled</option>
        </MorphNativeSelect>
        <MorphNativeSelect aria-label="Priority" value={priority} onChange={onPriority}>
          <option value="ALL">Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </MorphNativeSelect>
        <MorphNativeSelect aria-label="Assignee" value={assignee} onChange={onAssignee}>
          <option value="ALL">Assignee</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </MorphNativeSelect>
        <MorphNativeSelect aria-label="Source" value={source} onChange={onSource}>
          <option value="ALL">Source</option>
          <option value="MANUAL">Manual</option>
          <option value="FINDING">Finding</option>
        </MorphNativeSelect>
        <MorphNativeSelect aria-label="Sort" value={sort} onChange={onSort}>
          <option value="updatedAt:desc">Recently updated</option>
          <option value="dueDate:asc">Due date</option>
          <option value="priority:desc">Priority</option>
          <option value="createdAt:desc">Newest</option>
        </MorphNativeSelect>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
export function TasksTable({ tasks, onOpen }: { tasks: Task[]; onOpen: (id: string) => void }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border-subtle/70 bg-bg-card/45 md:block">
        <div className="grid grid-cols-[minmax(240px,1.6fr)_minmax(150px,1fr)_150px_100px_130px_100px_36px] gap-4 border-b border-border-subtle/70 bg-bg-elevated/25 px-5 py-3 text-[11px] font-medium tracking-[0.08em] text-text-muted">
          <span>TASK</span>
          <span>SOURCE</span>
          <span>ASSIGNEE</span>
          <span>PRIORITY</span>
          <span>STATUS</span>
          <span>DUE</span>
          <span />
        </div>
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onOpen(task.id)}
            className={`grid min-h-[76px] w-full grid-cols-[minmax(240px,1.6fr)_minmax(150px,1fr)_150px_100px_130px_100px_36px] items-center gap-4 border-b border-border-subtle/50 px-5 text-left transition-colors last:border-0 hover:bg-bg-hover/45 ${task.isOverdue ? 'border-l-2 border-l-danger' : ''}`}
          >
            <span className="min-w-0">
              <span className="block text-[11px] tracking-[0.08em] text-text-muted">
                {task.taskNumber}
              </span>
              <span className="mt-1 block truncate text-sm font-medium text-text-primary">
                {task.title}
              </span>
              <span className="mt-1 block truncate text-xs text-text-muted">
                {task.description || 'No description'}
              </span>
            </span>
            <span className="truncate text-sm text-text-secondary">{taskSourceLabel(task)}</span>
            <TaskAssignee task={task} />
            <TaskPriorityBadge value={task.priority} />
            <TaskStatusBadge value={task.status} />
            <span
              className={
                task.isOverdue
                  ? 'text-sm text-danger'
                  : task.status === 'DONE'
                    ? 'text-sm text-success'
                    : 'text-sm text-text-muted'
              }
            >
              {task.isOverdue ? `${task.daysOverdue}d overdue` : formatTaskDate(task.dueDate)}
            </span>
            <MoreHorizontal className="size-4 text-text-muted" />
          </button>
        ))}
      </div>
      <div className="space-y-2 md:hidden">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onOpen(task.id)}
            className="w-full rounded-xl border border-border-subtle/70 bg-bg-card/45 p-4 text-left hover:bg-bg-hover/45"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.08em] text-text-muted">{task.taskNumber}</p>
                <p className="mt-1 truncate font-medium text-text-primary">{task.title}</p>
              </div>
              <MoreHorizontal className="size-4 shrink-0 text-text-muted" />
            </div>
            <p className="mt-2 truncate text-xs text-text-muted">{taskSourceLabel(task)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <TaskStatusBadge value={task.status} />
              <TaskPriorityBadge value={task.priority} />
              <TaskAssignee task={task} />
            </div>
            <p
              className={
                task.isOverdue ? 'mt-3 text-xs text-danger' : 'mt-3 text-xs text-text-muted'
              }
            >
              {task.isOverdue ? `${task.daysOverdue} days overdue` : formatTaskDate(task.dueDate)} ·
              Updated {formatTaskRelativeDate(task.updatedAt)}
            </p>
          </button>
        ))}
      </div>
    </>
  );
}
export function TaskPagination({
  pagination,
  onPage,
}: {
  pagination: { page: number; pageSize: number; total: number; totalPages: number } | undefined;
  onPage: (page: number) => void;
}) {
  if (!pagination?.total) return null;
  const from = (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);
  return (
    <div className="flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {from}–{to} of {pagination.total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="px-2 text-text-secondary">
          {pagination.page} / {Math.max(pagination.totalPages, 1)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
export function TasksEmpty({
  filtered,
  myTasks,
  onClear,
  onCreate,
}: {
  filtered: boolean;
  myTasks: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-heading text-lg text-text-primary">
        {filtered
          ? 'No tasks match these filters.'
          : myTasks
            ? "You don't have any assigned tasks."
            : 'No tasks yet'}
      </p>
      <p className="mt-2 text-sm text-text-muted">
        {filtered
          ? 'Try a broader search or clear the active filters.'
          : 'Tasks created for remediation and compliance work will appear here.'}
      </p>
      <Button variant="outline" className="mt-5" onClick={filtered ? onClear : onCreate}>
        {filtered ? (
          'Clear filters'
        ) : (
          <>
            <Plus className="size-4" />
            New Task
          </>
        )}
      </Button>
    </div>
  );
}
export function TasksSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-14 animate-pulse rounded-lg bg-bg-elevated" />
      ))}
    </div>
  );
}
