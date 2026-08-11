export type OnboardingStepId =
  | 'organization'
  | 'goals'
  | 'frameworks'
  | 'team'
  | 'defaults'
  | 'review';

export type GoalId = 'risk' | 'compliance' | 'controls' | 'audits';

export type InvitationRole =
  | 'GRC_ADMIN'
  | 'RISK_MANAGER'
  | 'COMPLIANCE_MANAGER'
  | 'AUDITOR'
  | 'CONTROL_OWNER'
  | 'VIEWER';

export type InvitationDraft = {
  id: string;
  email: string;
  role: InvitationRole;
};

export type WorkspaceDefaults = {
  timezone: string;
  scoring: string;
  reviewFrequency: string;
};

export type OnboardingDraft = {
  currentStep: OnboardingStepId;
  organizationName: string;
  workspaceSlug: string;
  goals: GoalId[];
  frameworks: string[];
  invitations: InvitationDraft[];
  invitationEmail: string;
  invitationRole: InvitationRole;
  workspaceDefaults: WorkspaceDefaults;
  completed: boolean;
};

export type OnboardingAction =
  | { type: 'set-step'; step: OnboardingStepId }
  | { type: 'set-organization-name'; value: string }
  | { type: 'set-workspace-slug'; value: string }
  | { type: 'toggle-goal'; goal: GoalId }
  | { type: 'toggle-framework'; frameworkId: string }
  | { type: 'set-invitation-email'; value: string }
  | { type: 'set-invitation-role'; value: InvitationRole }
  | { type: 'add-invitation'; invitation: InvitationDraft }
  | { type: 'remove-invitation'; invitationId: string }
  | { type: 'set-default'; key: keyof WorkspaceDefaults; value: string }
  | { type: 'complete' }
  | { type: 'hydrate'; draft: OnboardingDraft };
