export const settingsKeys = {
  profile: () => ['settings', 'profile'] as const,
  preferences: () => ['settings', 'preferences'] as const,
  notifications: () => ['settings', 'notifications'] as const,
  sessions: () => ['settings', 'sessions'] as const,
  organization: (organizationId: string) => ['settings', 'organization', organizationId] as const,
};
