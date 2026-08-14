import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { AuditDetail } from '@/features/audits/audit-detail';

export const metadata: Metadata = { title: 'Audit | RiskSphere' };
export default function AuditDetailPage() {
  return (
    <ProtectedRoute>
      <AuditDetail />
    </ProtectedRoute>
  );
}
