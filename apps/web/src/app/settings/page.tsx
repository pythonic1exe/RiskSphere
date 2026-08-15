import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { SettingsPage } from '@/features/settings/settings-page';
export const metadata: Metadata = { title: 'Settings | RiskSphere' };
export default function SettingsRoute() { return <ProtectedRoute><SettingsPage /></ProtectedRoute>; }
