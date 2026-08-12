'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { apiRequest, getMyOrganizations } from '@/features/auth/auth-client';

import { initialDraft } from './data';
import type { InvitationDraft, OnboardingAction, OnboardingDraft, OnboardingStepId, WorkspaceDefaults } from './types';

type CatalogFramework = { id: string; code: string; name: string; description: string | null; status: string };
type BackendStep = 'ORGANIZATION_SETUP' | 'GRC_GOALS' | 'FRAMEWORKS' | 'MEMBERS' | 'DEFAULTS' | 'REVIEW';

const stepToBackend: Record<OnboardingStepId, BackendStep> = {
  organization: 'ORGANIZATION_SETUP', goals: 'GRC_GOALS', frameworks: 'FRAMEWORKS', team: 'MEMBERS', defaults: 'DEFAULTS', review: 'REVIEW',
};
const backendToStep: Record<BackendStep, OnboardingStepId> = {
  ORGANIZATION_SETUP: 'organization', GRC_GOALS: 'goals', FRAMEWORKS: 'frameworks', MEMBERS: 'team', DEFAULTS: 'defaults', REVIEW: 'review',
};

function reducer(state: OnboardingDraft, action: OnboardingAction): OnboardingDraft {
  switch (action.type) {
    case 'set-organization-id': return { ...state, organizationId: action.organizationId };
    case 'set-step': return { ...state, currentStep: action.step };
    case 'set-organization-name': return { ...state, organizationName: action.value };
    case 'set-workspace-slug': return { ...state, workspaceSlug: action.value.toLowerCase().replace(/\s+/g, '-') };
    case 'toggle-goal': return { ...state, goals: state.goals.includes(action.goal) ? state.goals.filter((goal) => goal !== action.goal) : [...state.goals, action.goal] };
    case 'toggle-framework': return { ...state, frameworks: state.frameworks.includes(action.frameworkId) ? state.frameworks.filter((id) => id !== action.frameworkId) : [...state.frameworks, action.frameworkId] };
    case 'set-invitation-email': return { ...state, invitationEmail: action.value };
    case 'set-invitation-role': return { ...state, invitationRole: action.value };
    case 'add-invitation': return { ...state, invitations: [...state.invitations, action.invitation], invitationEmail: '' };
    case 'remove-invitation': return { ...state, invitations: state.invitations.filter((invitation) => invitation.id !== action.invitationId) };
    case 'set-default': return { ...state, workspaceDefaults: { ...state.workspaceDefaults, [action.key]: action.value } };
    case 'complete': return { ...state, completed: true };
    case 'hydrate': return action.draft;
    default: return state;
  }
}

type OnboardingContextValue = {
  draft: OnboardingDraft;
  dispatch: Dispatch<OnboardingAction>;
  frameworks: CatalogFramework[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  advance: (next: OnboardingStepId) => Promise<void>;
  toggleFramework: (frameworkId: string) => Promise<void>;
  addInvitation: (invitation: InvitationDraft) => Promise<void>;
  removeInvitation: (invitationId: string) => Promise<void>;
  setDefault: (key: keyof WorkspaceDefaults, value: string) => Promise<void>;
  complete: () => Promise<void>;
};

const DraftContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [draft, dispatch] = useReducer(reducer, initialDraft);
  const [frameworks, setFrameworks] = useState<CatalogFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      getMyOrganizations(),
      apiRequest<{ frameworks: CatalogFramework[] }>('/framework-catalog'),
    ]).then(([organizations, catalog]) => {
      if (!active) return;
      setFrameworks(catalog.frameworks);
      const organization = organizations.find((item) => item.status === 'PENDING_ONBOARDING' && item.onboarding?.status === 'IN_PROGRESS') ?? organizations[0];
      if (organization?.status === 'ACTIVE' && organization.onboarding?.status === 'COMPLETED') {
        router.replace('/workspace');
        return;
      }
      if (!organization) return;
      dispatch({ type: 'set-organization-id', organizationId: organization.id });
      dispatch({ type: 'set-organization-name', value: organization.name });
      dispatch({ type: 'set-workspace-slug', value: organization.slug });
      apiRequest<{
        organization: { name: string; slug: string; timezone: string | null };
        onboarding: { currentStep: BackendStep | null; lastStep: BackendStep | null };
        selectedFrameworkIds: string[];
      }>(`/organizations/${organization.id}/onboarding`).then((summary) => {
        if (!active) return;
        if (summary.organization.timezone) dispatch({ type: 'set-default', key: 'timezone', value: summary.organization.timezone });
        if (summary.selectedFrameworkIds.length) dispatch({ type: 'hydrate', draft: { ...initialDraft, organizationId: organization.id, organizationName: summary.organization.name, workspaceSlug: summary.organization.slug, frameworks: summary.selectedFrameworkIds, currentStep: summary.onboarding.currentStep ? backendToStep[summary.onboarding.currentStep] : 'organization' } });
        else if (summary.onboarding.currentStep) dispatch({ type: 'set-step', step: backendToStep[summary.onboarding.currentStep] });
      });
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Unable to load onboarding'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  async function advance(next: OnboardingStepId) {
    setSaving(true); setError(null);
    try {
      let organizationId = draft.organizationId;
      if (!organizationId) {
        const created = await apiRequest<{ organization: { id: string }; onboarding: unknown }>('/organizations', { method: 'POST', body: JSON.stringify({ name: draft.organizationName.trim(), slug: draft.workspaceSlug, timezone: draft.workspaceDefaults.timezone, locale: 'en-US' }) });
        organizationId = created.organization.id;
        dispatch({ type: 'set-organization-id', organizationId });
      } else if (draft.currentStep === 'organization') {
        await apiRequest(`/organizations/${organizationId}`, { method: 'PATCH', body: JSON.stringify({ name: draft.organizationName.trim(), slug: draft.workspaceSlug, timezone: draft.workspaceDefaults.timezone }) });
      }
      await apiRequest(`/organizations/${organizationId}/onboarding`, { method: 'PATCH', body: JSON.stringify({ currentStep: stepToBackend[next], lastStep: stepToBackend[draft.currentStep] }) });
      dispatch({ type: 'set-step', step: next });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save onboarding'); throw cause; } finally { setSaving(false); }
  }

  async function toggleFramework(frameworkId: string) {
    if (!draft.organizationId) return;
    setSaving(true); setError(null);
    try {
      const selected = draft.frameworks.includes(frameworkId);
      await apiRequest(`/organizations/${draft.organizationId}/framework-selections/${frameworkId}`, { method: selected ? 'DELETE' : 'POST' });
      dispatch({ type: 'toggle-framework', frameworkId });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update framework'); } finally { setSaving(false); }
  }

  async function addInvitation(invitation: InvitationDraft) {
    if (!draft.organizationId) return;
    setSaving(true); setError(null);
    try {
      const response = await apiRequest<{ invitation: { id: string } }>(`/organizations/${draft.organizationId}/invitations`, { method: 'POST', body: JSON.stringify({ email: invitation.email, roleCode: invitation.role }) });
      dispatch({ type: 'add-invitation', invitation: { ...invitation, id: response.invitation.id } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to create invitation'); throw cause; } finally { setSaving(false); }
  }

  async function removeInvitation(invitationId: string) {
    if (!draft.organizationId) return;
    setSaving(true); setError(null);
    try { await apiRequest(`/organizations/${draft.organizationId}/invitations/${invitationId}`, { method: 'DELETE' }); dispatch({ type: 'remove-invitation', invitationId }); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to remove invitation'); } finally { setSaving(false); }
  }

  async function setDefault(key: keyof WorkspaceDefaults, value: string) {
    dispatch({ type: 'set-default', key, value });
    if (key === 'timezone' && draft.organizationId) await apiRequest(`/organizations/${draft.organizationId}`, { method: 'PATCH', body: JSON.stringify({ timezone: value }) });
  }

  async function complete() {
    if (!draft.organizationId) return;
    setSaving(true); setError(null);
    try { await apiRequest(`/organizations/${draft.organizationId}/onboarding/complete`, { method: 'POST' }); dispatch({ type: 'complete' }); router.replace('/workspace'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to complete onboarding'); } finally { setSaving(false); }
  }

  const value = useMemo(() => ({ draft, dispatch, frameworks, loading, saving, error, advance, toggleFramework, addInvitation, removeInvitation, setDefault, complete }), [draft, error, frameworks, loading, saving]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(DraftContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
