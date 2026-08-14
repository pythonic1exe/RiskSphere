import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { OrganizationPage } from '@/features/organization/organization-page';
export const metadata: Metadata = { title: 'Organization | RiskSphere' };
export default function OrganizationRoute() { return <ProtectedRoute><OrganizationPage /></ProtectedRoute>; }
