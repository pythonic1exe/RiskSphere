export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unrated';
export type RiskStatus = 'Mitigating' | 'Open' | 'Monitoring' | 'Accepted';
export type ControlEffectiveness = 'Effective' | 'Needs Review' | 'At Risk';
export type EvidenceStatus = 'Complete' | 'Pending' | 'Missing';
export type AuditTestStatus = 'Passed' | 'Failed' | 'Pending Evidence' | 'In Review';

export interface LandingMetric {
  label: string;
  value: string;
  detail: string;
}

export interface LandingRisk {
  id: string;
  title: string;
  category: string;
  owner: string;
  likelihood: string;
  impact: string;
  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;
  status: RiskStatus;
  mappedControls: number;
}

export interface LandingControl {
  id: string;
  title: string;
  owner: string;
  frequency: string;
  controlType: string;
  effectiveness: ControlEffectiveness;
  nextExecution: string;
  mappedRisks: number;
  mappedRequirements: number;
  evidenceStatus: EvidenceStatus;
}

export interface LandingRequirement {
  id: string;
  framework: string;
  requirement: string;
  coverage: string;
  mappedControls: number;
  evidence: string;
  state: string;
}

export interface LandingAudit {
  id: string;
  title: string;
  status: string;
  testsComplete: string;
  evidenceRequested: number;
  openFindings: number;
  scope: string;
}

export interface WorkflowStep {
  label: string;
  detail: string;
  status: 'complete' | 'active' | 'pending';
}

export interface FeatureTile {
  title: string;
  detail: string;
  layout: 'large' | 'medium' | 'small';
}

