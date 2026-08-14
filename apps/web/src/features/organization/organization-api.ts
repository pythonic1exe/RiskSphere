import { apiRequest } from '@/features/auth/auth-client';

export type OrganizationStatus = 'PENDING_ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type MembershipStatus = 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
export type Role = { id: string; code: string; name: string };
export type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
export type Organization = {
  id: string; name: string; slug: string; status: OrganizationStatus;
  timezone: string | null; locale: string | null; createdAt: string; updatedAt: string;
  onboarding?: { status: string; currentStep: string | null; lastStep: string | null } | null;
};
export type Member = { id: string; organizationId: string; userId: string; email: string; status: MembershipStatus; createdAt: string; updatedAt: string; roles: Role[] };
export type Invitation = { id: string; organizationId: string; invitedEmail: string; status: InvitationStatus; role: Role; invitedBy: string; expiresAt: string; createdAt: string; acceptedAt: string | null; revokedAt: string | null };
export type Unit = { id: string; organizationId: string; name: string; code: string | null; description: string | null; parentId: string | null; parent?: { id: string; name: string; code: string | null } | null; isActive: boolean; createdAt: string; updatedAt: string; counts: { children: number; members: number } };
export type UnitMember = { membershipId: string; email: string; status: MembershipStatus; roles: Array<{ code: string; name: string }> };
export type OrganizationSummary = { members: { total: number; active: number }; invitations: { pending: number }; units: { total: number } };
export type MemberListParams = { page?: number; pageSize?: number; search?: string; role?: string; status?: MembershipStatus; sortBy?: 'email' | 'status' | 'createdAt' | 'updatedAt'; sortOrder?: 'asc' | 'desc' };
export type InvitationListParams = { page?: number; pageSize?: number; search?: string; status?: InvitationStatus; roleId?: string; sortBy?: 'invitedEmail' | 'status' | 'createdAt' | 'expiresAt'; sortOrder?: 'asc' | 'desc' };
export type UnitListParams = { search?: string; parentId?: string | null; isActive?: boolean };
export type UpdateOrganizationInput = { name?: string; slug?: string; timezone?: string | null; locale?: string | null };
export type CreateInvitationInput = { email: string; roleCode: string };
export type UpdateMemberInput = { roleCodes?: string[]; status?: MembershipStatus };
export type UnitInput = { name: string; code?: string | null; description?: string | null; parentId?: string | null };
export type UpdateUnitInput = Partial<UnitInput> & { isActive?: boolean };

function qs(params: Record<string, unknown>) { const query = new globalThis.URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '' && value !== null) query.set(key, String(value)); }); return query.toString(); }
function path(organizationId: string, suffix = '') { return `/organizations/${organizationId}${suffix}`; }

export const getOrganization = (id: string) => apiRequest<{ organization: Organization }>(path(id));
export const getOrganizationSummary = (id: string) => apiRequest<OrganizationSummary>(path(id, '/summary'));
export const updateOrganization = (id: string, body: UpdateOrganizationInput) => apiRequest<{ organization: Organization }>(path(id), { method: 'PATCH', body: JSON.stringify(body) });
export const getMembers = (id: string, params: MemberListParams = {}) => apiRequest<{ data: Member[]; pagination: Pagination }>(`${path(id, '/members')}?${qs(params)}`);
export const getMember = (id: string, membershipId: string) => apiRequest<Member>(path(id, `/members/${membershipId}`));
export const updateMember = (id: string, membershipId: string, body: UpdateMemberInput) => apiRequest<Member>(path(id, `/members/${membershipId}`), { method: 'PATCH', body: JSON.stringify(body) });
export const removeMember = (id: string, membershipId: string) => apiRequest<Member>(path(id, `/members/${membershipId}`), { method: 'DELETE' });
export const getInvitations = (id: string, params: InvitationListParams = {}) => apiRequest<{ data: Invitation[]; pagination: Pagination }>(`${path(id, '/invitations')}?${qs(params)}`);
export const createInvitation = (id: string, body: CreateInvitationInput) => apiRequest<{ invitation: Invitation }>(path(id, '/invitations'), { method: 'POST', body: JSON.stringify(body) });
export const revokeInvitation = (id: string, invitationId: string) => apiRequest<{ invitation: Invitation }>(path(id, `/invitations/${invitationId}`), { method: 'DELETE' });
export const resendInvitation = (id: string, invitationId: string) => apiRequest<{ invitation: Invitation }>(path(id, `/invitations/${invitationId}/resend`), { method: 'POST' });
export const getUnits = (id: string, params: UnitListParams = {}) => apiRequest<{ data: Unit[] }>(`${path(id, '/units')}?${qs(params)}`);
export const getUnit = (id: string, unitId: string) => apiRequest<Unit>(path(id, `/units/${unitId}`));
export const createUnit = (id: string, body: UnitInput) => apiRequest<Unit>(path(id, '/units'), { method: 'POST', body: JSON.stringify(body) });
export const updateUnit = (id: string, unitId: string, body: UpdateUnitInput) => apiRequest<Unit>(path(id, `/units/${unitId}`), { method: 'PATCH', body: JSON.stringify(body) });
export const deactivateUnit = (id: string, unitId: string) => apiRequest<Unit>(path(id, `/units/${unitId}`), { method: 'DELETE' });
export const getUnitMembers = (id: string, unitId: string) => apiRequest<{ data: UnitMember[] }>(path(id, `/units/${unitId}/members`));
export const addUnitMember = (id: string, unitId: string, membershipId: string) => apiRequest(path(id, `/units/${unitId}/members`), { method: 'POST', body: JSON.stringify({ membershipId }) });
export const removeUnitMember = (id: string, unitId: string, membershipId: string) => apiRequest(path(id, `/units/${unitId}/members/${membershipId}`), { method: 'DELETE' });
