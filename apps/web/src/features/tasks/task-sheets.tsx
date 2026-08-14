'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Loader2, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MorphNativeSelect } from '@/components/ui/morph-select';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { OrganizationMember, Task } from './task-api';
import { taskFormSchema, type TaskFormValues } from './task-schemas';
import { formatTaskDate, formatTaskRelativeDate, taskActionAllowed } from './task-format';
import { TaskPriorityBadge, TaskStatusBadge } from './task-ui';
import {
  useBlockTask,
  useCancelTask,
  useCompleteTask,
  useCreateFindingTask,
  useCreateTask,
  useReopenTask,
  useStartTask,
  useTask,
  useTaskActivity,
  useUnblockTask,
  useUpdateTask,
} from './task-hooks';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}
function ReasonDialog({
  title,
  label,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-elevated p-6">
        <h2 className="font-heading text-xl text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-muted">{label}</p>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="mt-4 min-h-24"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
export function TaskFormSheet({
  organizationId,
  members,
  findingId,
  initialTask,
  open,
  onOpenChange,
  onSaved,
}: {
  organizationId: string;
  members: OrganizationMember[];
  findingId?: string;
  initialTask?: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (task: Task) => void;
}) {
  const create = useCreateTask(organizationId);
  const createFinding = useCreateFindingTask(organizationId, findingId ?? '');
  const update = useUpdateTask(organizationId, initialTask?.id ?? '');
  const [values, setValues] = useState<TaskFormValues>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeMembershipId: null,
    dueDate: null,
  });
  const [error, setError] = useState<string | null>(null);
  const mutation = initialTask ? update : findingId ? createFinding : create;
  useEffect(() => {
    if (!open) return;
    setValues(
      initialTask
        ? {
            title: initialTask.title,
            description: initialTask.description ?? '',
            priority: initialTask.priority,
            assigneeMembershipId: initialTask.assigneeMembershipId,
            dueDate: initialTask.dueDate ? initialTask.dueDate.slice(0, 10) : null,
          }
        : {
            title: '',
            description: '',
            priority: 'MEDIUM',
            assigneeMembershipId: null,
            dueDate: null,
          },
    );
    setError(null);
  }, [initialTask, open]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the form.');
      return;
    }
    setError(null);
    try {
      const result = await mutation.mutateAsync({
        title: parsed.data.title,
        description: parsed.data.description ?? '',
        priority: parsed.data.priority,
        assigneeMembershipId: parsed.data.assigneeMembershipId ?? null,
        dueDate: parsed.data.dueDate ?? null,
      });
      onSaved?.(result);
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save Task.');
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-border-default bg-bg-elevated sm:max-w-[500px]"
      >
        <SheetHeader className="border-b border-border-subtle px-6 py-5">
          <SheetTitle>
            {initialTask ? 'Edit Task' : findingId ? 'Create remediation task' : 'New Task'}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={(event) => void submit(event)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <Field label="Title">
              <Input
                required
                minLength={2}
                value={values.title}
                onChange={(event) => setValues({ ...values, title: event.target.value })}
              />
            </Field>
            <Field label="Description">
              <Textarea
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
                className="min-h-24"
              />
            </Field>
            <Field label="Priority">
              <MorphNativeSelect
                value={values.priority}
                onChange={(value) =>
                  setValues({ ...values, priority: value as TaskFormValues['priority'] })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </MorphNativeSelect>
            </Field>
            <Field label="Assignee">
              <MorphNativeSelect
                value={values.assigneeMembershipId ?? ''}
                onChange={(value) => setValues({ ...values, assigneeMembershipId: value || null })}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </MorphNativeSelect>
            </Field>
            <Field label="Due date">
              <Input
                type="date"
                value={values.dueDate ?? ''}
                onChange={(event) => setValues({ ...values, dueDate: event.target.value || null })}
              />
            </Field>
            {findingId ? (
              <p className="border border-border-subtle/70 bg-bg-card/40 px-3 py-3 text-sm text-text-muted">
                This Task will be linked to the current Finding.
              </p>
            ) : null}
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </div>
          <SheetFooter className="border-t border-border-subtle px-6 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin" /> : null}
              {initialTask ? 'Save changes' : 'Create Task'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
export function TaskDetailSheet({
  organizationId,
  taskId,
  open,
  onOpenChange,
  canManage,
  membershipId,
  onEdit,
  onRefresh,
}: {
  organizationId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  membershipId: string;
  onEdit: (task: Task) => void;
  onRefresh: () => void;
}) {
  const taskQuery = useTask(organizationId, taskId);
  const activityQuery = useTaskActivity(organizationId, taskId);
  const task = taskQuery.data;
  const execute = Boolean(task && (canManage || task.assigneeMembershipId === membershipId));
  const [dialog, setDialog] = useState<'block' | 'cancel' | 'reopen' | null>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const start = useStartTask(organizationId, taskId ?? '');
  const unblock = useUnblockTask(organizationId, taskId ?? '');
  const block = useBlockTask(organizationId, taskId ?? '');
  const complete = useCompleteTask(organizationId, taskId ?? '');
  const reopen = useReopenTask(organizationId, taskId ?? '');
  const cancel = useCancelTask(organizationId, taskId ?? '');
  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      onRefresh();
    } catch {
      /* detail query surfaces the backend error on refetch */
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-border-default bg-bg-elevated sm:max-w-[600px]"
      >
        <SheetHeader className="border-b border-border-subtle px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.1em] text-text-muted">
                {task?.taskNumber ?? 'Task'}
              </p>
              <SheetTitle className="mt-1 truncate">{task?.title ?? 'Loading task...'}</SheetTitle>
            </div>
            <MoreHorizontal className="mt-1 size-5 text-text-muted" />
          </div>
        </SheetHeader>
        {taskQuery.isLoading ? (
          <div className="p-6 text-sm text-text-muted">Loading task...</div>
        ) : taskQuery.isError || !task ? (
          <div className="p-6 text-sm text-danger">
            Unable to load this Task.{' '}
            <button type="button" className="underline" onClick={() => void taskQuery.refetch()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
              <div className="flex flex-wrap items-center gap-3">
                <TaskStatusBadge value={task.status} />
                <TaskPriorityBadge value={task.priority} />
                <span
                  className={task.isOverdue ? 'text-sm text-danger' : 'text-sm text-text-muted'}
                >
                  {task.isOverdue
                    ? `${task.daysOverdue} days overdue`
                    : formatTaskDate(task.dueDate)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {canManage ? (
                  <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                    Edit
                  </Button>
                ) : null}
                {execute && taskActionAllowed(task.status, 'start') ? (
                  <Button
                    size="sm"
                    disabled={start.isPending}
                    onClick={() => void run(() => start.mutateAsync(undefined))}
                  >
                    Start
                  </Button>
                ) : null}
                {execute && taskActionAllowed(task.status, 'unblock') ? (
                  <Button
                    size="sm"
                    disabled={unblock.isPending}
                    onClick={() => void run(() => unblock.mutateAsync(undefined))}
                  >
                    Unblock
                  </Button>
                ) : null}
                {execute && taskActionAllowed(task.status, 'block') ? (
                  <Button variant="outline" size="sm" onClick={() => setDialog('block')}>
                    Block
                  </Button>
                ) : null}
                {execute && taskActionAllowed(task.status, 'complete') ? (
                  <Button size="sm" onClick={() => setCompleteOpen(true)}>
                    Mark complete
                  </Button>
                ) : null}
                {canManage && taskActionAllowed(task.status, 'reopen') ? (
                  <Button variant="outline" size="sm" onClick={() => setDialog('reopen')}>
                    Reopen
                  </Button>
                ) : null}
                {canManage && taskActionAllowed(task.status, 'cancel') ? (
                  <Button variant="outline" size="sm" onClick={() => setDialog('cancel')}>
                    Cancel
                  </Button>
                ) : null}
              </div>
              <section className="space-y-4">
                <h3 className="border-b border-border-subtle pb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
                  Task information
                </h3>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-muted">Description</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-text-secondary">
                      {task.description || 'No description'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Assignee</dt>
                    <dd className="mt-1 text-text-secondary">
                      {task.assignee?.name ?? 'Unassigned'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Created</dt>
                    <dd className="mt-1 text-text-secondary">{formatTaskDate(task.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Updated</dt>
                    <dd className="mt-1 text-text-secondary">
                      {formatTaskRelativeDate(task.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="space-y-4">
                <h3 className="border-b border-border-subtle pb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
                  Related to
                </h3>
                {task.source.finding ? (
                  <Link
                    href={`/findings/${task.source.finding.id}`}
                    className="group flex items-center justify-between gap-3 border border-border-subtle/70 bg-bg-card/40 p-3"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-text-muted">Finding</span>
                      <span className="mt-1 block truncate text-sm text-text-primary">
                        {task.source.finding.findingNumber} · {task.source.finding.title}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-text-muted group-hover:text-text-primary" />
                  </Link>
                ) : (
                  <p className="text-sm text-text-muted">Manual Task</p>
                )}
              </section>
              {task.status === 'DONE' ? (
                <section className="space-y-3">
                  <h3 className="border-b border-border-subtle pb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
                    Completion
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {task.completionNotes || 'No completion notes.'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {task.completedAt ? formatTaskDate(task.completedAt) : ''}
                  </p>
                </section>
              ) : null}
              <section className="space-y-4">
                <h3 className="border-b border-border-subtle pb-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted">
                  Activity
                </h3>
                {activityQuery.isLoading ? (
                  <p className="text-sm text-text-muted">Loading activity...</p>
                ) : activityQuery.data?.data.length ? (
                  <div className="space-y-4">
                    {activityQuery.data.data.map((item) => (
                      <div key={item.id} className="border-l border-border-subtle pl-4">
                        <p className="text-sm text-text-secondary">
                          {item.type.replaceAll('_', ' ')}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {item.actorMembership?.user?.email ?? 'System'} ·{' '}
                          {formatTaskRelativeDate(item.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">No activity recorded.</p>
                )}
              </section>
            </div>
          </div>
        )}
        {dialog ? (
          <ReasonDialog
            title={
              dialog === 'block'
                ? 'Block Task'
                : dialog === 'cancel'
                  ? 'Cancel Task'
                  : 'Reopen Task'
            }
            label="A reason is required for this workflow action."
            onClose={() => setDialog(null)}
            onSubmit={(reason) => {
              setDialog(null);
              void run(() =>
                dialog === 'block'
                  ? block.mutateAsync(reason)
                  : dialog === 'cancel'
                    ? cancel.mutateAsync(reason)
                    : reopen.mutateAsync(reason),
              );
            }}
          />
        ) : null}
        {completeOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-elevated p-6">
              <h2 className="font-heading text-xl text-text-primary">Complete Task</h2>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-4 min-h-24"
                placeholder="Describe what was done..."
              />
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCompleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={complete.isPending}
                  onClick={() => {
                    setCompleteOpen(false);
                    void run(() => complete.mutateAsync({ completionNotes: notes }));
                  }}
                >
                  Complete Task
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
