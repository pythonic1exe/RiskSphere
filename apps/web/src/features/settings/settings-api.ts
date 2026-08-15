import { apiRequest } from '@/features/auth/auth-client';

export type Profile = { id: string; email: string; status: string; displayName: string | null; jobTitle: string | null; createdAt: string; updatedAt: string };
export type Preferences = { timezone: string | null; dateFormat: string | null; startPage: string | null; density: 'COMFORTABLE' | 'COMPACT' };
export type NotificationPreferences = { inAppEnabled: boolean; emailEnabled: boolean };
export type Session = { id: string; status: 'ACTIVE' | 'REVOKED' | 'EXPIRED'; expiresAt: string; createdAt: string; updatedAt: string; currentSession: boolean };
export type OrganizationSettings = { riskReviewFrequencyDays: number | null; findingDefaultDueDays: number | null; defaultTaskDueDays: number | null };
export type ProfileInput = { displayName?: string | null; jobTitle?: string | null };
export type PreferencesInput = Partial<Preferences>;
export type NotificationInput = Partial<NotificationPreferences>;
export type PasswordInput = { currentPassword: string; newPassword: string };

export const getProfile = () => apiRequest<Profile>('/users/me/profile');
export const updateProfile = (body: ProfileInput) => apiRequest<Profile>('/users/me/profile', { method: 'PATCH', body: JSON.stringify(body) });
export const getPreferences = () => apiRequest<Preferences>('/users/me/preferences');
export const updatePreferences = (body: PreferencesInput) => apiRequest<Preferences>('/users/me/preferences', { method: 'PATCH', body: JSON.stringify(body) });
export const getNotifications = () => apiRequest<NotificationPreferences>('/users/me/notification-preferences');
export const updateNotifications = (body: NotificationInput) => apiRequest<NotificationPreferences>('/users/me/notification-preferences', { method: 'PATCH', body: JSON.stringify(body) });
export const changePassword = (body: PasswordInput) => apiRequest<{ success: boolean }>('/users/me/change-password', { method: 'POST', body: JSON.stringify(body) });
export const getSessions = () => apiRequest<{ data: Session[] }>('/users/me/sessions');
export const revokeSession = (sessionId: string) => apiRequest<{ success: boolean }>(`/users/me/sessions/${sessionId}`, { method: 'DELETE' });
export const revokeOtherSessions = () => apiRequest<{ success: boolean; revoked: number }>('/users/me/sessions/revoke-others', { method: 'POST' });
export const getOrganizationSettings = (organizationId: string) => apiRequest<OrganizationSettings>(`/organizations/${organizationId}/settings`);
export const updateOrganizationSettings = (organizationId: string, body: Partial<OrganizationSettings>) => apiRequest<OrganizationSettings>(`/organizations/${organizationId}/settings`, { method: 'PATCH', body: JSON.stringify(body) });
