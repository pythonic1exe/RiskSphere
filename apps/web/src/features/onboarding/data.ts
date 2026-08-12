import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, ShieldCheck, SlidersHorizontal, TriangleAlert } from 'lucide-react';

import type { GoalId, InvitationRole, OnboardingDraft } from './types';

export const onboardingStorageKey = 'risksphere:onboarding-draft:v1';

export const goals: Array<{ id: GoalId; title: string; description: string; icon: LucideIcon }> = [
  { id: 'risk', title: 'Risk Management', description: 'Identify, assess, and monitor organizational risk.', icon: TriangleAlert },
  { id: 'compliance', title: 'Compliance', description: 'Translate obligations into an operating program.', icon: ShieldCheck },
  { id: 'controls', title: 'Controls', description: 'Put governance into repeatable execution.', icon: SlidersHorizontal },
  { id: 'audits', title: 'Audits', description: 'Test evidence and make assurance easier.', icon: ClipboardCheck },
];

export const frameworks = [
  { id: 'iso-27001', name: 'ISO 27001', description: 'Information Security Management' },
  { id: 'soc-2', name: 'SOC 2', description: 'Trust Services Criteria' },
  { id: 'nist-csf', name: 'NIST CSF', description: 'Cybersecurity Framework' },
  { id: 'gdpr', name: 'GDPR', description: 'Data protection and privacy' },
  { id: 'pci-dss', name: 'PCI DSS', description: 'Payment Card Industry standards' },
];

export const roleOptions: Array<{ value: InvitationRole; label: string }> = [
  { value: 'GRC_ADMIN', label: 'GRC Admin' },
  { value: 'RISK_MANAGER', label: 'Risk Manager' },
  { value: 'COMPLIANCE_MANAGER', label: 'Compliance Manager' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'CONTROL_OWNER', label: 'Control Owner' },
  { value: 'VIEWER', label: 'Viewer' },
];

export const initialDraft: OnboardingDraft = {
  organizationId: null,
  currentStep: 'organization',
  organizationName: '',
  workspaceSlug: '',
  goals: [],
  frameworks: [],
  invitations: [],
  invitationEmail: '',
  invitationRole: 'GRC_ADMIN',
  workspaceDefaults: {
    timezone: 'Asia/Karachi',
    scoring: '5×5 Impact × Likelihood',
    reviewFrequency: 'Quarterly',
  },
  completed: false,
};

export function roleLabel(role: InvitationRole) {
  return roleOptions.find((option) => option.value === role)?.label ?? role;
}

export function goalLabel(goalId: GoalId) {
  return goals.find((goal) => goal.id === goalId)?.title ?? goalId;
}
