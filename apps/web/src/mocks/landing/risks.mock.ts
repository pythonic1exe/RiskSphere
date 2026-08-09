import type { LandingRisk } from './types';

export const landingRisks: LandingRisk[] = [
  {
    id: 'risk-1',
    title: 'Third-Party Data Exposure',
    category: 'Cybersecurity',
    owner: 'Ayesha Khan',
    likelihood: 'Likely',
    impact: 'Severe',
    inherentRisk: 'Critical',
    residualRisk: 'Medium',
    status: 'Mitigating',
    mappedControls: 4,
  },
  {
    id: 'risk-2',
    title: 'Privileged Access Misuse',
    category: 'Identity & Access',
    owner: 'Marcus Chen',
    likelihood: 'Possible',
    impact: 'Severe',
    inherentRisk: 'High',
    residualRisk: 'Low',
    status: 'Monitoring',
    mappedControls: 5,
  },
  {
    id: 'risk-3',
    title: 'Unreviewed Policy Exceptions',
    category: 'Governance',
    owner: 'Elena Patel',
    likelihood: 'Likely',
    impact: 'Moderate',
    inherentRisk: 'Medium',
    residualRisk: 'Unrated',
    status: 'Open',
    mappedControls: 2,
  },
];

