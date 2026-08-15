import { useQuery, type QueryClient } from '@tanstack/react-query';
import * as api from './dashboard-api';
import { dashboardKeys } from './dashboard-query-keys';

export function useDashboardOverview(organizationId?: string) {
  return useQuery({ queryKey: dashboardKeys.overview(organizationId ?? ''), queryFn: () => api.getDashboardOverview(organizationId!), enabled: Boolean(organizationId), staleTime: 60_000, refetchOnWindowFocus: true });
}

export function invalidateDashboardOverview(client: QueryClient, organizationId: string) {
  return client.invalidateQueries({ queryKey: dashboardKeys.overview(organizationId) });
}
