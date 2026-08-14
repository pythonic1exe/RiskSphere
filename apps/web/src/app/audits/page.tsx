import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { AuditsRegister } from '@/features/audits/audits-register';

export const metadata: Metadata = { title: 'Audits | RiskSphere' };
export default function AuditsPage() {
  return (
    <ProtectedRoute>
      <AuditsRegister />
    </ProtectedRoute>
  );
}
