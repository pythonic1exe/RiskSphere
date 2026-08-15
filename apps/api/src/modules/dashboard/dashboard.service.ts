/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Injectable } from '@nestjs/common';
import { AuditStatus, ControlExecutionStatus, EvidenceStatus, FindingStatus, RiskStatus, TaskPriority, TaskStatus } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
import { PrismaService } from '../../database/prisma.service';
import { AuditsService } from '../audits/audits.service';
import { ComplianceService } from '../compliance/compliance.service';
import { ControlsService } from '../controls/controls.service';
import { EvidenceService } from '../evidence/evidence.service';
import { FindingsService } from '../findings/findings.service';
import { RisksService } from '../risks/risks.service';
import { TasksService } from '../tasks/tasks.service';
import { buildDashboardAttention, buildUpcomingItems, DASHBOARD_COLLECTION_LIMIT } from './dashboard-presentation.utils';
import type { DashboardOverview } from './dashboard.types';

const DASHBOARD_HORIZON_DAYS = 30;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly risks: RisksService,
    private readonly controls: ControlsService,
    private readonly compliance: ComplianceService,
    private readonly evidence: EvidenceService,
    private readonly audits: AuditsService,
    private readonly findings: FindingsService,
    private readonly tasks: TasksService,
  ) {}

  async overview(access: OrganizationAccess): Promise<DashboardOverview> {
    const organizationId = access.organization.id;
    const now = new Date();
    const horizon = new Date(now.getTime() + DASHBOARD_HORIZON_DAYS * 24 * 60 * 60 * 1000);

    const [riskSummary, controlSummary, complianceSummary, evidenceSummary, auditSummary, findingSummary, taskSummary, assignedTasks, upcoming, recentlyUpdated] = await Promise.all([
      this.risks.summary(access),
      this.controls.summary(access),
      this.compliance.summary(access),
      this.evidence.summary(access),
      this.audits.summary(access, now),
      this.findings.summary(access),
      this.tasks.summary(access),
      this.prisma.task.findMany({
        where: { organizationId, assigneeMembershipId: access.membership.id, status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] } },
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }, { updatedAt: 'desc' }],
        take: DASHBOARD_COLLECTION_LIMIT,
        select: { id: true, taskNumber: true, title: true, status: true, priority: true, dueDate: true, findingId: true },
      }),
      this.upcomingRecords(organizationId, now, horizon),
      this.recentlyUpdatedRecords(organizationId),
    ]);

    const attention = buildDashboardAttention({
      risks: (riskSummary.attention ?? []).map((item: any) => ({ id: item.id, title: item.title, reason: item.reason, severity: item.severity, dueAt: item.dueAt ?? item.nextReviewAt })),
      controls: (controlSummary.attention ?? []).map((item: any) => ({ id: item.id, controlId: item.controlId, title: item.title, reason: item.reason, dueAt: item.dueAt })),
      evidence: (evidenceSummary.attention ?? []).map((item: any) => ({ id: item.id, title: item.title, reason: item.reason, dueAt: item.expiresAt })),
      findings: await this.findingAttention(organizationId, now),
      tasks: await this.taskAttention(organizationId, now),
    });

    return {
      generatedAt: now.toISOString(),
      organization: { id: organizationId, name: access.organization.name },
      posture: {
        risks: { active: riskSummary.active, highCritical: riskSummary.criticalHigh, dueForReview: riskSummary.dueForReview },
        compliance: { percentage: complianceSummary.compliancePercent, assessmentCoveragePercentage: complianceSummary.assessmentCoveragePercent, controlCoveragePercentage: complianceSummary.controlCoveragePercent },
        controls: { active: controlSummary.active, overdueExecutions: controlSummary.overdueExecutions, dueSoonExecutions: controlSummary.dueSoon },
        evidence: { current: evidenceSummary.current, expired: evidenceSummary.expired, expiringSoon: evidenceSummary.expiringSoon, traceabilityPercentage: evidenceSummary.traceability.linkedToControlPercent },
      },
      riskDistribution: riskSummary.severityDistribution,
      audits: auditSummary,
      findings: { open: findingSummary.open, inRemediation: findingSummary.inRemediation, readyForValidation: findingSummary.readyForValidation, overdue: findingSummary.overdue, highCritical: findingSummary.high + findingSummary.critical },
      tasks: taskSummary,
      attention,
      myTasks: assignedTasks.map((task) => ({ id: task.id, taskNumber: task.taskNumber, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate?.toISOString() ?? null, findingId: task.findingId })),
      upcoming: buildUpcomingItems(now, upcoming),
      recentlyUpdated,
    };
  }

  private async findingAttention(organizationId: string, now: Date) {
    const findings = await this.prisma.finding.findMany({
      where: { organizationId, status: { not: FindingStatus.CLOSED }, OR: [{ dueDate: { lt: now } }, { severity: { in: ['HIGH', 'CRITICAL'] } }] },
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }], take: 8,
      select: { id: true, title: true, severity: true, dueDate: true },
    });
    return findings.map((finding) => ({ id: finding.id, title: finding.title, severity: finding.severity, dueAt: finding.dueDate, reason: finding.dueDate && finding.dueDate < now ? 'Overdue finding' : 'High-severity finding' }));
  }

  private async taskAttention(organizationId: string, now: Date) {
    const tasks = await this.prisma.task.findMany({
      where: { organizationId, status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }, priority: { in: [TaskPriority.HIGH, TaskPriority.CRITICAL] }, OR: [{ dueDate: { lt: now } }, { dueDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }] },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }], take: 8,
      select: { id: true, title: true, priority: true, dueDate: true },
    });
    return tasks.map((task) => ({ id: task.id, title: task.title, priority: task.priority, dueAt: task.dueDate, reason: task.dueDate && task.dueDate < now ? 'Overdue task' : 'Task due soon' }));
  }

  private async upcomingRecords(organizationId: string, now: Date, horizon: Date) {
    const [audits, risks, controls, evidence, findings, tasks] = await Promise.all([
      this.prisma.audit.findMany({ where: { organizationId, status: { not: AuditStatus.CANCELLED }, plannedStartAt: { gte: now, lte: horizon } }, select: { id: true, title: true, plannedStartAt: true } }),
      this.prisma.risk.findMany({ where: { organizationId, status: { not: RiskStatus.ARCHIVED }, nextReviewAt: { gte: now, lte: horizon } }, select: { id: true, title: true, nextReviewAt: true } }),
      this.prisma.controlExecution.findMany({ where: { organizationId, status: { notIn: [ControlExecutionStatus.COMPLETED, ControlExecutionStatus.CANCELLED] }, dueAt: { gte: now, lte: horizon } }, select: { id: true, dueAt: true, control: { select: { id: true, title: true } } } }),
      this.prisma.evidence.findMany({ where: { organizationId, status: { not: EvidenceStatus.ARCHIVED }, expiresAt: { gte: now, lte: horizon } }, select: { id: true, title: true, expiresAt: true } }),
      this.prisma.finding.findMany({ where: { organizationId, status: { not: FindingStatus.CLOSED }, dueDate: { gte: now, lte: horizon } }, select: { id: true, title: true, dueDate: true } }),
      this.prisma.task.findMany({ where: { organizationId, status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }, dueDate: { gte: now, lte: horizon } }, select: { id: true, title: true, dueDate: true } }),
    ]);
    return [
      ...audits.filter((item) => item.plannedStartAt).map((item) => ({ entityType: 'AUDIT' as const, entityId: item.id, title: item.title, eventType: 'START_DATE', date: item.plannedStartAt! })),
      ...risks.filter((item) => item.nextReviewAt).map((item) => ({ entityType: 'RISK' as const, entityId: item.id, title: item.title, eventType: 'REVIEW', date: item.nextReviewAt! })),
      ...controls.map((item) => ({ entityType: 'CONTROL' as const, entityId: item.control.id, title: item.control.title, eventType: 'EXECUTION_DUE', date: item.dueAt })),
      ...evidence.filter((item) => item.expiresAt).map((item) => ({ entityType: 'EVIDENCE' as const, entityId: item.id, title: item.title, eventType: 'EXPIRATION', date: item.expiresAt! })),
      ...findings.filter((item) => item.dueDate).map((item) => ({ entityType: 'FINDING' as const, entityId: item.id, title: item.title, eventType: 'DUE_DATE', date: item.dueDate! })),
      ...tasks.filter((item) => item.dueDate).map((item) => ({ entityType: 'TASK' as const, entityId: item.id, title: item.title, eventType: 'DUE_DATE', date: item.dueDate! })),
    ];
  }

  private async recentlyUpdatedRecords(organizationId: string) {
    const [risks, controls, evidence, audits, findings, tasks] = await Promise.all([
      this.prisma.risk.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
      this.prisma.control.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
      this.prisma.evidence.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
      this.prisma.audit.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
      this.prisma.finding.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
      this.prisma.task.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
    ]);
    return [
      ...risks.map((item) => ({ entityType: 'RISK' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
      ...controls.map((item) => ({ entityType: 'CONTROL' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
      ...evidence.map((item) => ({ entityType: 'EVIDENCE' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
      ...audits.map((item) => ({ entityType: 'AUDIT' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
      ...findings.map((item) => ({ entityType: 'FINDING' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
      ...tasks.map((item) => ({ entityType: 'TASK' as const, entityId: item.id, title: item.title, status: item.status, updatedAt: item.updatedAt.toISOString() })),
    ].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()).slice(0, DASHBOARD_COLLECTION_LIMIT);
  }
}
