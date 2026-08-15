import { taskCompletionSummary, taskDueSoonState, taskOverdueState } from './tasks.utils';

function memberSummary(member: any) { return member ? { membershipId: member.id, name: member.user?.email ?? member.id } : null; }

export function mapTask(task: any, now = new Date()) {
  return {
    id: task.id,
    organizationId: task.organizationId,
    taskNumber: task.taskNumber,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    sourceType: task.sourceType,
    assigneeMembershipId: task.assigneeMembershipId,
    assignee: memberSummary(task.assigneeMembership),
    dueDate: task.dueDate,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    cancelledAt: task.cancelledAt,
    blockedReason: task.blockedReason,
    completionNotes: task.completionNotes,
    cancellationReason: task.cancellationReason,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    source: task.sourceType === 'FINDING'
      ? { type: task.sourceType, finding: task.finding ? { id: task.finding.id, findingNumber: task.finding.findingNumber, title: task.finding.title, severity: task.finding.severity, status: task.finding.status } : null }
      : { type: task.sourceType },
    ...taskOverdueState(task, now),
  };
}

export function mapTaskSummary(tasks: Array<{ status: string; priority: string; dueDate: Date | null; assigneeMembershipId: string | null }>, currentMembershipId: string, now = new Date()) {
  const summary = taskCompletionSummary(tasks);
  const overdue = tasks.filter((task) => taskOverdueState(task, now).isOverdue).length;
  const assigned = tasks.filter((task) => task.assigneeMembershipId === currentMembershipId);
  return {
    ...summary,
    total: tasks.length,
    critical: tasks.filter((task) => task.priority === 'CRITICAL').length,
    high: tasks.filter((task) => task.priority === 'HIGH').length,
    overdue,
    assignedToMe: assigned.length,
    assignedToMeOverdue: assigned.filter((task) => taskOverdueState(task, now).isOverdue).length,
    dueSoon: tasks.filter((task) => taskDueSoonState(task, now)).length,
    assignedToMeDueSoon: assigned.filter((task) => taskDueSoonState(task, now)).length,
  };
}

export function mapFindingTaskSummary(tasks: Array<{ status: string }>) {
  return taskCompletionSummary(tasks);
}
