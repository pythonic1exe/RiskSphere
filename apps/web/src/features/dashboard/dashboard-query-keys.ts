export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (organizationId: string) => [...dashboardKeys.all, organizationId, 'overview'] as const,
};
