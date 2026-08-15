import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, FileCheck2, Flag, Gauge, LayoutDashboard, ListChecks, Settings, ShieldAlert, SlidersHorizontal, Users } from 'lucide-react';

export type DashboardNavItem = { label: string; href: string; icon: LucideIcon };
export type DashboardNavGroup = { label: string; items: DashboardNavItem[] };

export const dashboardNavigation: DashboardNavGroup[] = [
  { label: 'Workspace Overview', items: [{ label: 'Dashboard', href: '/workspace', icon: LayoutDashboard }] },
  { label: 'Risk & Control', items: [{ label: 'Risks', href: '/risks', icon: ShieldAlert }, { label: 'Controls', href: '/controls', icon: SlidersHorizontal }, { label: 'Compliance', href: '/compliance', icon: Gauge }, { label: 'Evidence', href: '/evidence', icon: FileCheck2 }] },
  { label: 'Assurance & Findings', items: [{ label: 'Audits', href: '/audits', icon: ClipboardCheck }, { label: 'Findings', href: '/findings', icon: Flag }] },
  { label: 'Remediation', items: [{ label: 'Tasks', href: '/tasks', icon: ListChecks }] },
  { label: 'Administration', items: [{ label: 'Organization', href: '/organization', icon: Users }, { label: 'Settings', href: '/settings', icon: Settings }] },
];
