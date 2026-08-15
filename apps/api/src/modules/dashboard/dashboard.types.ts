export type DashboardEntityType = 'RISK' | 'CONTROL' | 'EVIDENCE' | 'FINDING' | 'TASK' | 'AUDIT';

export type DashboardAttentionItem = {
  id: string;
  entityType: Exclude<DashboardEntityType, 'AUDIT'>;
  entityId: string;
  title: string;
  reason: string;
  priority?: string;
  dueAt?: string | null;
};

export type DashboardTaskItem = {
  id: string;
  taskNumber: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  findingId: string | null;
};

export type DashboardUpcomingItem = {
  entityType: DashboardEntityType;
  entityId: string;
  title: string;
  eventType: string;
  date: string;
  label: string;
};

export type DashboardRecentlyUpdatedItem = {
  entityType: DashboardEntityType;
  entityId: string;
  title: string;
  updatedAt: string;
  status?: string | null;
};

export type DashboardOverview = {
  generatedAt: string;
  organization: { id: string; name: string };
  posture: {
    risks: { active: number; highCritical: number; dueForReview: number };
    compliance: { percentage: number; assessmentCoveragePercentage: number; controlCoveragePercentage: number };
    controls: { active: number; overdueExecutions: number; dueSoonExecutions: number };
    evidence: { current: number; expired: number; expiringSoon: number; traceabilityPercentage: number };
  };
  riskDistribution: Record<string, number>;
  audits: Record<string, number>;
  findings: Record<string, number>;
  tasks: Record<string, number | null>;
  attention: DashboardAttentionItem[];
  myTasks: DashboardTaskItem[];
  upcoming: DashboardUpcomingItem[];
  recentlyUpdated: DashboardRecentlyUpdatedItem[];
};
