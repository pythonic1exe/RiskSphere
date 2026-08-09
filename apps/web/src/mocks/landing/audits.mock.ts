import type { LandingAudit } from './types';

export const landingAudits: LandingAudit[] = [
  {
    id: 'aud-1',
    title: '2026 Internal Security Audit',
    status: 'In Progress',
    testsComplete: '24 / 36',
    evidenceRequested: 12,
    openFindings: 4,
    scope: 'Identity, access, vendor, logging',
  },
  {
    id: 'aud-2',
    title: 'Vendor Assurance Review',
    status: 'Planning',
    testsComplete: '4 / 12',
    evidenceRequested: 7,
    openFindings: 1,
    scope: 'Third-party controls, SOC 2 evidence',
  },
];

