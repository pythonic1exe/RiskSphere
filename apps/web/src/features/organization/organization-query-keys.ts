export const organizationKeys = {
  all: ['organization-admin'] as const,
  detail: (id: string) => ['organization-admin', id, 'detail'] as const,
  summary: (id: string) => ['organization-admin', id, 'summary'] as const,
  members: (id: string, params: unknown) => ['organization-admin', id, 'members', params] as const,
  member: (id: string, memberId: string) => ['organization-admin', id, 'member', memberId] as const,
  invitations: (id: string, params: unknown) => ['organization-admin', id, 'invitations', params] as const,
  units: (id: string, params: unknown = {}) => ['organization-admin', id, 'units', params] as const,
  unit: (id: string, unitId: string) => ['organization-admin', id, 'unit', unitId] as const,
  unitMembers: (id: string, unitId: string) => ['organization-admin', id, 'unit-members', unitId] as const,
};
