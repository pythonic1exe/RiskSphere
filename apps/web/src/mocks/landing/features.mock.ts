import type { FeatureTile } from './types';

export const landingFeatures: FeatureTile[] = [
  {
    title: 'Evidence Repository',
    detail: 'Versioned evidence history stays attached to the execution that produced it.',
    layout: 'large',
  },
  {
    title: 'Findings & Remediation',
    detail: 'Every finding drives actions, due-date changes, and independent verification.',
    layout: 'medium',
  },
  {
    title: 'Framework Mapping',
    detail: 'One control can satisfy multiple requirements without losing traceability.',
    layout: 'medium',
  },
  {
    title: 'Recurring Control Execution',
    detail: 'Controls turn into scheduled operational work with evidence requirements.',
    layout: 'small',
  },
  {
    title: 'Notifications',
    detail: 'Polling-friendly in-app alerts keep owners aware of due work and reviews.',
    layout: 'small',
  },
  {
    title: 'Tenant Administration',
    detail: 'Organizations stay isolated while sharing the same application and schema.',
    layout: 'small',
  },
  {
    title: 'RBAC',
    detail: 'Membership roles define what a tenant user can see and change.',
    layout: 'small',
  },
  {
    title: 'Complete Audit Trail',
    detail: 'Operational activity and security events remain separate from domain records.',
    layout: 'small',
  },
];

