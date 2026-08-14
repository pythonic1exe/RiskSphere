import type { Metadata } from 'next';
import { ProtectedRoute } from '@/features/auth/protected-route';
import { TasksRegister } from '@/features/tasks/tasks-register';

export const metadata: Metadata = { title: 'Tasks | RiskSphere' };
export default function TasksPage() { return <ProtectedRoute><TasksRegister /></ProtectedRoute>; }
