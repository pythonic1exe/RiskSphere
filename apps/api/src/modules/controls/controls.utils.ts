import type { ControlExecutionStatus } from '@prisma/client';

export function nextControlCode(existingCodes: string[]): string {
  const nextNumber = existingCodes.reduce((max, code) => {
    const match = /^CTRL-(\d+)$/.exec(code);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0) + 1;
  return `CTRL-${String(nextNumber).padStart(3, '0')}`;
}

export function canTransitionControlExecution(
  current: ControlExecutionStatus,
  next: ControlExecutionStatus,
): boolean {
  const transitions: Record<ControlExecutionStatus, ControlExecutionStatus[]> = {
    SCHEDULED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };
  return transitions[current].includes(next);
}

export function isExecutionOverdue(
  dueAt: Date,
  status: ControlExecutionStatus,
  now = new Date(),
): boolean {
  return dueAt.getTime() < now.getTime() && status !== 'COMPLETED' && status !== 'CANCELLED';
}
