import type { LandingControl } from './types';

export const landingControls: LandingControl[] = [
  {
    id: 'ctrl-1',
    title: 'Quarterly Privileged Access Review',
    owner: 'IT Security',
    frequency: 'Quarterly',
    controlType: 'Detective',
    effectiveness: 'Effective',
    nextExecution: 'Sep 30',
    mappedRisks: 3,
    mappedRequirements: 5,
    evidenceStatus: 'Complete',
  },
  {
    id: 'ctrl-2',
    title: 'Vendor Security Questionnaire Review',
    owner: 'Vendor Risk',
    frequency: 'Monthly',
    controlType: 'Preventive',
    effectiveness: 'Needs Review',
    nextExecution: 'Sep 14',
    mappedRisks: 2,
    mappedRequirements: 3,
    evidenceStatus: 'Pending',
  },
  {
    id: 'ctrl-3',
    title: 'Firewall Rule Change Approval',
    owner: 'Infrastructure',
    frequency: 'Per change',
    controlType: 'Preventive',
    effectiveness: 'At Risk',
    nextExecution: 'Today',
    mappedRisks: 1,
    mappedRequirements: 2,
    evidenceStatus: 'Missing',
  },
];

