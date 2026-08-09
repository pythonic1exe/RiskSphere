import type { WorkflowStep } from './types';

export const landingWorkflow: WorkflowStep[] = [
  { label: 'Risk / Requirement', detail: 'A risk or requirement is created and owned.', status: 'complete' },
  { label: 'Control', detail: 'A reusable control is mapped to the obligation.', status: 'complete' },
  { label: 'Recurring Execution', detail: 'The control becomes scheduled work.', status: 'active' },
  { label: 'Evidence', detail: 'Support is collected and reviewed.', status: 'pending' },
  { label: 'Audit Test', detail: 'Evidence is sampled in an audit.', status: 'pending' },
  { label: 'Finding / Remediation', detail: 'Issues are tracked to closure.', status: 'pending' },
];

