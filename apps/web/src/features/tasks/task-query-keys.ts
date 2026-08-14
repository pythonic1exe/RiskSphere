export const taskKeys = {
  all: ['tasks'] as const,
  lists: (organizationId: string) => [...taskKeys.all, organizationId, 'list'] as const,
  list: (organizationId: string, params: unknown) =>
    [...taskKeys.lists(organizationId), params] as const,
  summary: (organizationId: string) => [...taskKeys.all, organizationId, 'summary'] as const,
  dueSoon: (organizationId: string, from: string, to: string) =>
    [...taskKeys.all, organizationId, 'due-soon', from, to] as const,
  detail: (organizationId: string, taskId: string) =>
    [...taskKeys.all, organizationId, 'detail', taskId] as const,
  activity: (organizationId: string, taskId: string) =>
    [...taskKeys.detail(organizationId, taskId), 'activity'] as const,
  members: (organizationId: string) => ['organization-members', organizationId] as const,
  findingLists: (organizationId: string, findingId: string) =>
    [...taskKeys.all, organizationId, 'finding', findingId, 'list'] as const,
  findingList: (organizationId: string, findingId: string, params: unknown) =>
    [...taskKeys.findingLists(organizationId, findingId), params] as const,
};
