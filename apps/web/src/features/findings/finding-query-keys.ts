export const findingKeys = {
  all: ['findings'] as const,
  lists: (organizationId: string) => [...findingKeys.all, organizationId, 'list'] as const,
  list: (organizationId: string, params: unknown) => [...findingKeys.lists(organizationId), params] as const,
  summary: (organizationId: string) => [...findingKeys.all, organizationId, 'summary'] as const,
  detail: (organizationId: string, findingId: string) => [...findingKeys.all, organizationId, 'detail', findingId] as const,
  evidence: (organizationId: string, findingId: string) => [...findingKeys.detail(organizationId, findingId), 'evidence'] as const,
  validations: (organizationId: string, findingId: string) => [...findingKeys.detail(organizationId, findingId), 'validations'] as const,
  activity: (organizationId: string, findingId: string) => [...findingKeys.detail(organizationId, findingId), 'activity'] as const,
};
