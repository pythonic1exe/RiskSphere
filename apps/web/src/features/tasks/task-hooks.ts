import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './task-api';
import { taskKeys } from './task-query-keys';
import { invalidateDashboardOverview } from '@/features/dashboard/dashboard-hooks';

export function useTasks(organizationId: string | undefined, params: api.TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(organizationId ?? '', params),
    queryFn: () => api.getTasks(organizationId!, params),
    enabled: Boolean(organizationId),
    placeholderData: (previous) => previous,
  });
}
export function useTaskSummary(organizationId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.summary(organizationId ?? ''),
    queryFn: () => api.getTaskSummary(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: 30_000,
  });
}
export function useTaskDueSoonCount(organizationId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.summary(organizationId ?? ''),
    queryFn: () => api.getTaskSummary(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: 30_000,
    select: (summary) => summary.dueSoon,
  });
}
export function useTask(organizationId: string | undefined, taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(organizationId ?? '', taskId ?? ''),
    queryFn: () => api.getTask(organizationId!, taskId!),
    enabled: Boolean(organizationId && taskId),
  });
}
export function useTaskActivity(organizationId: string | undefined, taskId: string | null) {
  return useQuery({
    queryKey: taskKeys.activity(organizationId ?? '', taskId ?? ''),
    queryFn: () => api.getTaskActivity(organizationId!, taskId!),
    enabled: Boolean(organizationId && taskId),
  });
}
export function useOrganizationMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.members(organizationId ?? ''),
    queryFn: () => api.getOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
    staleTime: 60_000,
  });
}
export function useFindingTasks(
  organizationId: string | undefined,
  findingId: string | undefined,
  params: api.TaskListParams = {},
) {
  return useQuery({
    queryKey: taskKeys.findingList(organizationId ?? '', findingId ?? '', params),
    queryFn: () => api.getFindingTasks(organizationId!, findingId!, params),
    enabled: Boolean(organizationId && findingId),
    placeholderData: (previous) => previous,
  });
}
function useTaskMutation<T>(
  organizationId: string | undefined,
  taskId: string | undefined,
  mutationFn: (body: T) => Promise<api.Task>,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (!organizationId) return;
      void client.invalidateQueries({ queryKey: taskKeys.lists(organizationId) });
      void client.invalidateQueries({ queryKey: taskKeys.summary(organizationId) });
      if (taskId) {
        void client.invalidateQueries({ queryKey: taskKeys.detail(organizationId, taskId) });
        void client.invalidateQueries({ queryKey: taskKeys.activity(organizationId, taskId) });
      }
      void client.invalidateQueries({ queryKey: taskKeys.all });
      void invalidateDashboardOverview(client, organizationId);
    },
  });
}
export function useCreateTask(organizationId: string | undefined) {
  return useTaskMutation(organizationId, undefined, (body: api.CreateTaskInput) =>
    api.createTask(organizationId!, body),
  );
}
export function useCreateFindingTask(organizationId: string | undefined, findingId: string) {
  return useTaskMutation(organizationId, undefined, (body: api.CreateTaskInput) =>
    api.createFindingTask(organizationId!, findingId, body),
  );
}
export function useUpdateTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation(organizationId, taskId, (body: api.UpdateTaskInput) =>
    api.updateTask(organizationId!, taskId, body),
  );
}
export function useStartTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation<void>(organizationId, taskId, () =>
    api.startTask(organizationId!, taskId),
  );
}
export function useUnblockTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation<void>(organizationId, taskId, () =>
    api.unblockTask(organizationId!, taskId),
  );
}
export function useBlockTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation(organizationId, taskId, (reason: string) =>
    api.blockTask(organizationId!, taskId, reason),
  );
}
export function useCompleteTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation(organizationId, taskId, (body: api.CompleteTaskInput) =>
    api.completeTask(organizationId!, taskId, body),
  );
}
export function useReopenTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation(organizationId, taskId, (reason: string) =>
    api.reopenTask(organizationId!, taskId, reason),
  );
}
export function useCancelTask(organizationId: string | undefined, taskId: string) {
  return useTaskMutation(organizationId, taskId, (reason: string) =>
    api.cancelTask(organizationId!, taskId, reason),
  );
}
