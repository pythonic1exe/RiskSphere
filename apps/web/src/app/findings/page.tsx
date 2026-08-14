import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { FindingsRegister } from '@/features/findings/findings-register';

export const metadata: Metadata = { title: 'Findings | RiskSphere' };
export default function FindingsPage() { return <ProtectedRoute><FindingsRegister /></ProtectedRoute>; }
