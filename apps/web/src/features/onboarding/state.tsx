'use client';

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';

import { initialDraft, onboardingStorageKey } from './data';
import type { OnboardingAction, OnboardingDraft } from './types';

function reducer(state: OnboardingDraft, action: OnboardingAction): OnboardingDraft {
  switch (action.type) {
    case 'set-step':
      return { ...state, currentStep: action.step };
    case 'set-organization-name':
      return { ...state, organizationName: action.value };
    case 'set-workspace-slug':
      return { ...state, workspaceSlug: action.value.toLowerCase().replace(/\s+/g, '-') };
    case 'toggle-goal':
      return { ...state, goals: state.goals.includes(action.goal) ? state.goals.filter((goal) => goal !== action.goal) : [...state.goals, action.goal] };
    case 'toggle-framework':
      return { ...state, frameworks: state.frameworks.includes(action.frameworkId) ? state.frameworks.filter((id) => id !== action.frameworkId) : [...state.frameworks, action.frameworkId] };
    case 'set-invitation-email':
      return { ...state, invitationEmail: action.value };
    case 'set-invitation-role':
      return { ...state, invitationRole: action.value };
    case 'add-invitation':
      return { ...state, invitations: [...state.invitations, action.invitation], invitationEmail: '' };
    case 'remove-invitation':
      return { ...state, invitations: state.invitations.filter((invitation) => invitation.id !== action.invitationId) };
    case 'set-default':
      return { ...state, workspaceDefaults: { ...state.workspaceDefaults, [action.key]: action.value } };
    case 'complete':
      return { ...state, completed: true };
    case 'hydrate':
      return action.draft;
    default:
      return state;
  }
}

const DraftContext = createContext<{ draft: OnboardingDraft; dispatch: Dispatch<OnboardingAction> } | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(reducer, initialDraft);
  const [hydrated, setHydrated] = useReducer(() => true, false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(onboardingStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingDraft;
        if (parsed && typeof parsed === 'object' && parsed.workspaceDefaults && Array.isArray(parsed.goals)) dispatch({ type: 'hydrate', draft: { ...initialDraft, ...parsed } });
      }
    } catch {
      window.localStorage.removeItem(onboardingStorageKey);
    } finally {
      setHydrated();
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(onboardingStorageKey, JSON.stringify(draft));
  }, [draft, hydrated]);

  const value = useMemo(() => ({ draft, dispatch }), [draft]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(DraftContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
