import type { InvitationStatus, MembershipStatus, OrganizationStatus, Unit } from './organization-api';
export const titleCase = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
export const statusLabel = (value: MembershipStatus | InvitationStatus | OrganizationStatus) => titleCase(value);
export const initials = (email: string) => (email.split('@')[0] ?? '').split(/[._-]/).map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) : '—';
export function unitTree(units: Unit[]) { const byParent = new Map<string | null, Unit[]>(); units.forEach((unit) => { const list = byParent.get(unit.parentId) ?? []; list.push(unit); byParent.set(unit.parentId, list); }); return byParent; }
export function descendantIds(units: Unit[], id: string) { const children = unitTree(units); const result = new Set<string>([id]); const visit = (parent: string) => (children.get(parent) ?? []).forEach((child) => { result.add(child.id); visit(child.id); }); visit(id); return result; }
