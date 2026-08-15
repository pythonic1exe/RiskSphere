import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './settings-api';
import { settingsKeys as keys } from './settings-query-keys';
export const useProfile = () => useQuery({ queryKey: keys.profile(), queryFn: api.getProfile });
export const usePreferences = () => useQuery({ queryKey: keys.preferences(), queryFn: api.getPreferences });
export const useNotifications = () => useQuery({ queryKey: keys.notifications(), queryFn: api.getNotifications });
export const useSessions = () => useQuery({ queryKey: keys.sessions(), queryFn: api.getSessions });
export const useOrganizationSettings = (organizationId?: string) => useQuery({ queryKey: keys.organization(organizationId ?? ''), queryFn: () => api.getOrganizationSettings(organizationId!), enabled: Boolean(organizationId) });
function mutation<T, R>(key: readonly unknown[], fn: (body: T) => Promise<R>, extra?: () => void) { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => { void client.invalidateQueries({ queryKey: key }); extra?.(); } }); }
export const useUpdateProfile = () => mutation<api.ProfileInput, api.Profile>(keys.profile(), api.updateProfile);
export const useUpdatePreferences = () => mutation<api.PreferencesInput, api.Preferences>(keys.preferences(), api.updatePreferences);
export const useUpdateNotifications = () => mutation<api.NotificationInput, api.NotificationPreferences>(keys.notifications(), api.updateNotifications);
export const useChangePassword = () => mutation<api.PasswordInput, { success: boolean }>(['settings', 'security'], api.changePassword, () => { const client = useQueryClient(); void client.invalidateQueries({ queryKey: keys.sessions() }); });
export const useRevokeSession = () => mutation<string, { success: boolean }>(keys.sessions(), api.revokeSession);
export const useRevokeOtherSessions = () => mutation<void, { success: boolean; revoked: number }>(keys.sessions(), () => api.revokeOtherSessions());
export const useUpdateOrganizationSettings = (organizationId?: string) => mutation<Partial<api.OrganizationSettings>, api.OrganizationSettings>(keys.organization(organizationId ?? ''), (body) => api.updateOrganizationSettings(organizationId!, body));
