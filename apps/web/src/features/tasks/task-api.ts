import { apiRequest } from '@/features/auth/auth-client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskSourceType = 'MANUAL' | 'FINDING';
export type TaskActivityType =
  | 'CREATED'
  | 'UPDATED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'REASSIGNED'
  | 'PRIORITY_CHANGED'
  | 'DUE_DATE_CHANGED'
  | 'STARTED'
  | 'BLOCKED'
  | 'UNBLOCKED'
  | 'COMPLETED'
  | 'REOPENED'
  | 'CANCELLED';

export type TaskAssignee = { membershipId: string; name: string } | null;
export type TaskSource = {
  type: TaskSourceType;
  finding?: {
    id: string;
    findingNumber: string;
    title: string;
    severity: string;
    status: string;
  } | null;
};
export type Task = {
  id: string;
  organizationId: string;
  taskNumber: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  sourceType: TaskSourceType;
  assigneeMembershipId: string | null;
  assignee: TaskAssignee;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  blockedReason: string | null;
  completionNotes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  source: TaskSource;
  isOverdue: boolean;
  daysOverdue: number;
};
export type TaskPagination = { page: number; pageSize: number; total: number; totalPages: number };
export type TaskListResponse = { data: Task[]; pagination: TaskPagination };
export type TaskSummary = {
  total: number;
  todo: number;
  inProgress: number;
  blocked: number;
  done: number;
  cancelled: number;
  completionPercentage: number | null;
  critical: number;
  high: number;
  overdue: number;
  assignedToMe: number;
  assignedToMeOverdue: number;
  dueSoon: number;
  assignedToMeDueSoon: number;
};
export type TaskActivity = {
  id: string;
  type: TaskActivityType;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actorMembership?: { id: string; user?: { email: string } | null } | null;
};
export type OrganizationMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  roles: Array<{ code: string; name: string }>;
};
export type TaskListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeMembershipId?: string;
  sourceType?: TaskSourceType;
  findingId?: string;
  overdue?: boolean;
  assignedToMe?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: 'taskNumber' | 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
};
export type CreateTaskInput = {
  title: string;
  description?: string;
  priority: TaskPriority;
  assigneeMembershipId?: string | null;
  dueDate?: string | null;
};
export type UpdateTaskInput = Partial<CreateTaskInput>;
export type CompleteTaskInput = { completionNotes?: string };

function queryString(params: TaskListParams) {
  const query = new globalThis.URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  return query.toString();
}
function listPath(organizationId: string, params: TaskListParams = {}) {
  const query = queryString(params);
  return `/organizations/${organizationId}/tasks${query ? `?${query}` : ''}`;
}

export function getTasks(organizationId: string, params: TaskListParams = {}) {
  return apiRequest<TaskListResponse>(listPath(organizationId, params));
}
export function getTaskSummary(organizationId: string) {
  return apiRequest<TaskSummary>(`/organizations/${organizationId}/tasks/summary`);
}
export function getTask(organizationId: string, taskId: string) {
  return apiRequest<Task>(`/organizations/${organizationId}/tasks/${taskId}`);
}
export function getTaskActivity(organizationId: string, taskId: string) {
  return apiRequest<{ data: TaskActivity[] }>(
    `/organizations/${organizationId}/tasks/${taskId}/activity`,
  );
}
export function getOrganizationMembers(organizationId: string) {
  return apiRequest<{ data: OrganizationMember[] }>(`/organizations/${organizationId}/members`);
}
export function createTask(organizationId: string, body: CreateTaskInput) {
  return apiRequest<Task>(`/organizations/${organizationId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function createFindingTask(
  organizationId: string,
  findingId: string,
  body: CreateTaskInput,
) {
  return apiRequest<Task>(`/organizations/${organizationId}/findings/${findingId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function updateTask(organizationId: string, taskId: string, body: UpdateTaskInput) {
  return apiRequest<Task>(`/organizations/${organizationId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
function workflow(organizationId: string, taskId: string, action: string, body?: unknown) {
  return apiRequest<Task>(`/organizations/${organizationId}/tasks/${taskId}/${action}`, {
    method: 'POST',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
export const startTask = (organizationId: string, taskId: string) =>
  workflow(organizationId, taskId, 'start');
export const unblockTask = (organizationId: string, taskId: string) =>
  workflow(organizationId, taskId, 'unblock');
export const blockTask = (organizationId: string, taskId: string, reason: string) =>
  workflow(organizationId, taskId, 'block', { reason });
export const completeTask = (organizationId: string, taskId: string, body: CompleteTaskInput) =>
  workflow(organizationId, taskId, 'complete', body);
export const reopenTask = (organizationId: string, taskId: string, reason: string) =>
  workflow(organizationId, taskId, 'reopen', { reason });
export const cancelTask = (organizationId: string, taskId: string, reason: string) =>
  workflow(organizationId, taskId, 'cancel', { reason });
export function getFindingTasks(
  organizationId: string,
  findingId: string,
  params: TaskListParams = {},
) {
  const query = queryString(params);
  return apiRequest<TaskListResponse>(
    `/organizations/${organizationId}/findings/${findingId}/tasks${query ? `?${query}` : ''}`,
  );
}
