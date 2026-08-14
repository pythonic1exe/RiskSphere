import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { AuditTestDetail } from '@/features/audits/audit-test-detail';

export const metadata: Metadata = { title: 'Audit Test | RiskSphere' };
export default function AuditTestPage() {
  return (
    <ProtectedRoute>
      <AuditTestDetail />
    </ProtectedRoute>
  );
}
