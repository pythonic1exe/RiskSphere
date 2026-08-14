import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { FindingDetail } from '@/features/findings/finding-detail';

export const metadata: Metadata = { title: 'Finding | RiskSphere' };
export default function FindingPage() { return <ProtectedRoute><FindingDetail /></ProtectedRoute>; }
