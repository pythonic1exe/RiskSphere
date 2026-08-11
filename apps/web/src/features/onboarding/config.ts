import type { OnboardingStepId } from './types';

export const onboardingSteps: Array<{ id: OnboardingStepId; label: string; title: string; description: string; stepperLabel: string; stepperDescription: string; optional?: boolean }> = [
  { id: 'organization', label: 'Organization', title: 'Set up your organization', description: 'Start with the basic information for your RiskSphere workspace.', stepperLabel: 'Organization', stepperDescription: 'Name and workspace details.' },
  { id: 'goals', label: 'Goals', title: 'What do you want to manage?', description: 'Choose the areas that matter most right now. You can adjust this later.', stepperLabel: 'GRC Goals', stepperDescription: "Choose what you'll manage." },
  { id: 'frameworks', label: 'Frameworks', title: 'Choose your compliance frameworks', description: 'Select the standards you work with today. Frameworks can be configured later.', stepperLabel: 'Frameworks', stepperDescription: 'Select relevant standards.', optional: true },
  { id: 'team', label: 'Team', title: 'Bring your team into RiskSphere', description: 'Invite the people who will help operate your GRC program.', stepperLabel: 'Team', stepperDescription: 'Invite teammates and roles.', optional: true },
  { id: 'defaults', label: 'Defaults', title: 'Set your workspace defaults', description: 'A few sensible defaults to get your workspace ready.', stepperLabel: 'Defaults', stepperDescription: 'Set core workspace options.' },
  { id: 'review', label: 'Review', title: 'Review your workspace', description: 'Everything can be adjusted later from organization settings.', stepperLabel: 'Review', stepperDescription: 'Confirm and finish setup.' },
];

export const stepIndex = (id: OnboardingStepId) => onboardingSteps.findIndex((step) => step.id === id);
