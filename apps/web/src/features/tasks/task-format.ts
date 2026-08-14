import type { Task, TaskPriority, TaskStatus } from './task-api';

export const taskStatusLabel: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};
export const taskPriorityLabel: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};
export function formatTaskDate(value: string | null) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
export function formatTaskRelativeDate(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.round(delta / 60000);
  if (Math.abs(minutes) < 60) return `${Math.max(1, Math.abs(minutes))}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${Math.max(1, Math.abs(hours))}h ago`;
  return `${Math.max(1, Math.round(hours / 24))}d ago`;
}
export function taskSourceLabel(task: Task) {
  return task.source.finding
    ? `${task.source.finding.findingNumber} · ${task.source.finding.title}`
    : task.sourceType === 'FINDING'
      ? 'Finding'
      : 'Manual task';
}
export function taskActionAllowed(
  status: TaskStatus,
  action: 'start' | 'block' | 'unblock' | 'complete' | 'reopen' | 'cancel',
) {
  return (
    {
      TODO: ['start', 'block', 'cancel'],
      IN_PROGRESS: ['block', 'complete', 'cancel'],
      BLOCKED: ['start', 'unblock', 'cancel'],
      DONE: ['reopen'],
      CANCELLED: [],
    }[status] as string[]
  ).includes(action);
}
