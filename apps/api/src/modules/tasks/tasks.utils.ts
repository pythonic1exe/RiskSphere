import type { TaskStatus } from '@prisma/client';

const DAY_MS = 24 * 60 * 60 * 1000;

export function canTransitionTask(current: TaskStatus | string, next: TaskStatus | string): boolean {
  const transitions: Record<string, string[]> = {
    TODO: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
    IN_PROGRESS: ['BLOCKED', 'DONE', 'CANCELLED'],
    BLOCKED: ['IN_PROGRESS', 'CANCELLED'],
    DONE: ['TODO'],
    CANCELLED: [],
  };
  return transitions[current]?.includes(next) ?? false;
}

export function taskNumber(year: number, sequence: number): string {
  return `TSK-${year}-${String(sequence).padStart(4, '0')}`;
}

export function taskOverdueState(task: { status: string; dueDate: Date | null }, now = new Date()) {
  if (['DONE', 'CANCELLED'].includes(task.status) || !task.dueDate || task.dueDate >= now) return { isOverdue: false, daysOverdue: 0 };
  return { isOverdue: true, daysOverdue: Math.floor((now.getTime() - task.dueDate.getTime()) / DAY_MS) };
}

export function taskCompletionSummary(tasks: Array<{ status: string }>) {
  const active = tasks.filter((task) => task.status !== 'CANCELLED');
  const count = (status: string) => tasks.filter((task) => task.status === status).length;
  return {
    total: active.length,
    todo: count('TODO'),
    inProgress: count('IN_PROGRESS'),
    blocked: count('BLOCKED'),
    done: count('DONE'),
    cancelled: count('CANCELLED'),
    completionPercentage: active.length ? Math.round((count('DONE') / active.length) * 100) : null,
  };
}
