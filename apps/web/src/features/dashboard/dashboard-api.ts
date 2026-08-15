import { apiRequest } from '@/features/auth/auth-client';
import type { DashboardOverview } from './dashboard-types';

export function getDashboardOverview(organizationId: string) {
  return apiRequest<DashboardOverview>(`/organizations/${organizationId}/dashboard/overview`);
}
