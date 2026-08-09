import type { LandingRequirement } from './types';

export const landingRequirements: LandingRequirement[] = [
  {
    id: 'req-1',
    framework: 'ISO 27001',
    requirement: 'A.8.2.3 Handling of assets',
    coverage: '2 controls',
    mappedControls: 2,
    evidence: 'Policy + quarterly review',
    state: 'Implemented',
  },
  {
    id: 'req-2',
    framework: 'SOC 2',
    requirement: 'CC6.1 Logical access',
    coverage: '4 controls',
    mappedControls: 4,
    evidence: 'Reviews + logs + tickets',
    state: 'In progress',
  },
  {
    id: 'req-3',
    framework: 'GDPR',
    requirement: 'Data processing records',
    coverage: '1 control',
    mappedControls: 1,
    evidence: 'Evidence pending',
    state: 'Partially covered',
  },
];

