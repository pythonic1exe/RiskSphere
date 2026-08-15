import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindingActivityType,
  FindingEvidencePurpose,
  FindingResolutionType,
  FindingSourceType,
  FindingStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type {
  CloseFindingExceptionallyDto,
  CreateFindingDto,
  ListFindingsDto,
  PromoteObservationDto,
  ReopenFindingDto,
  UpdateFindingDto,
} from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingActivityService } from './finding-activity.service';
import { findingNumber, canTransitionFinding } from './findings.utils';
import { mapFinding, mapFindingSummary } from './finding-presentation.utils';
import { mapFindingTaskSummary } from '../tasks/task-presentation.utils';

const FINDING_WRITE_ROLES = [
  ORGANIZATION_ROLE_CODES.OWNER,
  ORGANIZATION_ROLE_CODES.GRC_ADMIN,
  ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
];

@Injectable()
export class FindingsService {
  constructor(private readonly prisma: PrismaService, private readonly activities: FindingActivityService) {}

  organizationId(access: OrganizationAccess) { return access.organization.id; }

  assertManage(access: OrganizationAccess) {
    if (!access.roleCodes.some((role) => FINDING_WRITE_ROLES.includes(role as (typeof FINDING_WRITE_ROLES)[number]))) {
      throw new ForbiddenException('Not allowed to manage Findings');
    }
  }

  private async assertMembership(organizationId: string, membershipId: string | null | undefined, field: string, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    if (!membershipId) return;
    const membership = await tx.membership.findFirst({ where: { organizationId, id: membershipId, status: 'ACTIVE' }, select: { id: true } });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private include() {
    return {
      ownerMembership: { include: { user: { select: { id: true, email: true } } } },
      sourceObservation: { include: { auditTest: { include: { audit: { select: { id: true, code: true, title: true } } } } } },
      validations: { orderBy: { createdAt: 'desc' as const }, take: 1 },
      _count: { select: { evidence: true, validations: true, activities: true } },
    };
  }

  async getRecord(access: OrganizationAccess, findingId: string) {
    const finding = await this.prisma.finding.findFirst({ where: { organizationId: this.organizationId(access), id: findingId }, include: this.include() });
    if (!finding) throw new NotFoundException('Finding not found');
    return finding;
  }

  async list(access: OrganizationAccess, dto: ListFindingsDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const now = new Date();
    const and: Prisma.FindingWhereInput[] = [];
    if (dto.dueBefore) and.push({ dueDate: { lte: new Date(dto.dueBefore) } });
    if (dto.dueAfter) and.push({ dueDate: { gte: new Date(dto.dueAfter) } });
    if (dto.overdue === true) and.push({ status: { not: FindingStatus.CLOSED } }, { dueDate: { lt: now } });
    if (dto.overdue === false) and.push({ OR: [{ status: FindingStatus.CLOSED }, { dueDate: null }, { dueDate: { gte: now } }] });
    if (dto.search) and.push({ OR: [
      { findingNumber: { contains: dto.search, mode: 'insensitive' } },
      { title: { contains: dto.search, mode: 'insensitive' } },
      { description: { contains: dto.search, mode: 'insensitive' } },
    ] });
    const where: Prisma.FindingWhereInput = {
      organizationId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.severity ? { severity: dto.severity } : {}),
      ...(dto.sourceType ? { sourceType: dto.sourceType } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(and.length ? { AND: and } : {}),
    };
    const [findings, total] = await Promise.all([
      this.prisma.finding.findMany({ where, include: this.include(), orderBy: { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.finding.count({ where }),
    ]);
    return { data: findings.map((finding) => mapFinding(finding, now)), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async summary(access: OrganizationAccess) {
    const organizationId = this.organizationId(access);
    const now = new Date();
    const findings = await this.prisma.finding.findMany({ where: { organizationId }, select: { status: true, severity: true, dueDate: true } });
    return mapFindingSummary(findings, now);
  }

  async findOne(access: OrganizationAccess, findingId: string) {
    const finding = await this.getRecord(access, findingId);
    const tasks = await this.prisma.task.findMany({ where: { organizationId: this.organizationId(access), findingId }, select: { status: true } });
    return mapFinding(finding, new Date(), mapFindingTaskSummary(tasks));
  }

  async create(access: OrganizationAccess, dto: CreateFindingDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    return this.prisma.$transaction(async (tx) => {
      const year = new Date().getUTCFullYear();
      const findingNumberValue = await this.allocateNumber(tx, organizationId, year);
      const setting = tx.organizationSetting ? await tx.organizationSetting.findUnique({ where: { organizationId }, select: { findingDefaultDueDays: true } }) : null;
      const dueDate = dto.dueDate ? new Date(dto.dueDate) : setting?.findingDefaultDueDays ? new Date(Date.now() + setting.findingDefaultDueDays * 86400000) : null;
      const finding = await tx.finding.create({ data: {
        organizationId,
        findingNumber: findingNumberValue,
        title: dto.title.trim(),
        description: dto.description?.trim() || dto.title.trim(),
        severity: dto.severity,
        sourceType: FindingSourceType.MANUAL,
        ownerMembershipId: dto.ownerMembershipId ?? null,
        rootCause: dto.rootCause?.trim() || null,
        impact: dto.impact?.trim() || null,
        recommendation: dto.recommendation?.trim() || null,
        remediationPlan: dto.remediationPlan?.trim() || null,
        dueDate,
        createdByMembershipId: access.membership.id,
        updatedByMembershipId: access.membership.id,
      } });
      await this.activities.append(tx, { organizationId, findingId: finding.id, actorMembershipId: access.membership.id, type: FindingActivityType.CREATED, toStatus: FindingStatus.OPEN });
      return mapFinding(finding);
    });
  }

  async update(access: OrganizationAccess, findingId: string, dto: UpdateFindingDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    const current = await this.getRecord(access, findingId);
    if (current.status === FindingStatus.CLOSED) throw new ConflictException('Closed Findings can only be modified by reopening them first');
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    const data: Prisma.FindingUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.ownerMembershipId !== undefined) data.ownerMembershipId = dto.ownerMembershipId;
    if (dto.rootCause !== undefined) data.rootCause = dto.rootCause?.trim() || null;
    if (dto.impact !== undefined) data.impact = dto.impact?.trim() || null;
    if (dto.recommendation !== undefined) data.recommendation = dto.recommendation?.trim() || null;
    if (dto.remediationPlan !== undefined) data.remediationPlan = dto.remediationPlan?.trim() || null;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.finding.update({ where: { organizationId_id: { organizationId, id: findingId } }, data });
      await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.UPDATED });
      if (dto.ownerMembershipId !== undefined && dto.ownerMembershipId !== current.ownerMembershipId) await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.OWNER_CHANGED });
      if (dto.severity !== undefined && dto.severity !== current.severity) await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.SEVERITY_CHANGED });
      if (dto.remediationPlan !== undefined) await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.REMEDIATION_UPDATED });
      return mapFinding(updated);
    });
  }

  async startRemediation(access: OrganizationAccess, findingId: string) {
    this.assertManage(access);
    const current = await this.getRecord(access, findingId);
    if (!current.ownerMembershipId) throw new ConflictException('Finding owner is required before remediation can start');
    if (!current.remediationPlan?.trim()) throw new ConflictException('Remediation plan is required before remediation can start');
    return this.transition(access, findingId, FindingStatus.IN_REMEDIATION, FindingActivityType.REMEDIATION_STARTED);
  }

  async submitForValidation(access: OrganizationAccess, findingId: string) {
    this.assertManage(access);
    const current = await this.getRecord(access, findingId);
    if (!current.ownerMembershipId) throw new ConflictException('Finding owner is required before validation');
    if (!current.remediationPlan?.trim()) throw new ConflictException('Remediation plan is required before validation');
    const evidence = await this.prisma.findingEvidence.count({ where: { organizationId: this.organizationId(access), findingId, purpose: FindingEvidencePurpose.REMEDIATION } });
    if (!evidence) throw new ConflictException('At least one remediation evidence version is required before validation');
    const incompleteTasks = await this.prisma.task.count({ where: { organizationId: this.organizationId(access), findingId, status: { notIn: ['DONE', 'CANCELLED'] } } });
    if (incompleteTasks > 0) throw new ConflictException('Cannot submit Finding for validation while remediation tasks remain incomplete.');
    return this.transition(access, findingId, FindingStatus.READY_FOR_VALIDATION, FindingActivityType.SUBMITTED_FOR_VALIDATION, { submittedForValidationAt: new Date() });
  }

  async reopen(access: OrganizationAccess, findingId: string, dto: ReopenFindingDto) {
    this.assertManage(access);
    if (!dto.rationale.trim()) throw new BadRequestException('Reopen rationale is required');
    return this.transition(access, findingId, FindingStatus.OPEN, FindingActivityType.REOPENED, { closedAt: null }, { rationale: dto.rationale.trim() });
  }

  async closeExceptionally(access: OrganizationAccess, findingId: string, dto: CloseFindingExceptionallyDto) {
    this.assertManage(access);
    if (dto.resolutionType === FindingResolutionType.REMEDIATED) throw new BadRequestException('REMEDIATED Findings must close through validation');
    if (!dto.resolutionRationale.trim()) throw new BadRequestException('Resolution rationale is required');
    const current = await this.getRecord(access, findingId);
    if (current.status === FindingStatus.CLOSED) throw new ConflictException('Finding is already closed');
    return this.prisma.$transaction(async (tx) => {
      const finding = await tx.finding.update({ where: { organizationId_id: { organizationId: this.organizationId(access), id: findingId } }, data: { status: FindingStatus.CLOSED, closedAt: new Date(), resolutionType: dto.resolutionType, resolutionRationale: dto.resolutionRationale.trim(), updatedByMembershipId: access.membership.id } });
      await this.activities.append(tx, { organizationId: this.organizationId(access), findingId, actorMembershipId: access.membership.id, type: FindingActivityType.CLOSED, fromStatus: current.status, toStatus: FindingStatus.CLOSED, metadata: { resolutionType: dto.resolutionType, rationale: dto.resolutionRationale.trim() } });
      return mapFinding(finding);
    });
  }

  async promoteObservation(access: OrganizationAccess, auditTestId: string, observationId: string, dto: PromoteObservationDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    const observation = await this.prisma.auditTestObservation.findFirst({ where: { organizationId, id: observationId, auditTestId }, include: { finding: { select: { id: true } }, auditTest: { include: { audit: { select: { id: true, status: true } } } } } });
    if (!observation) throw new NotFoundException('Audit Test observation not found');
    if (observation.finding) throw new ConflictException('Observation has already been promoted to a Finding');
    if (observation.auditTest.audit.status === 'CANCELLED') throw new ConflictException('Cancelled Audits cannot promote observations to Findings');
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    return this.prisma.$transaction(async (tx) => {
      const findingNumberValue = await this.allocateNumber(tx, organizationId, new Date().getUTCFullYear());
      const finding = await tx.finding.create({ data: {
        organizationId,
        findingNumber: findingNumberValue,
        title: dto.title.trim(),
        description: dto.description?.trim() || observation.content,
        severity: dto.severity,
        sourceType: FindingSourceType.AUDIT_OBSERVATION,
        sourceObservationId: observationId,
        ownerMembershipId: dto.ownerMembershipId ?? null,
        impact: dto.impact?.trim() || null,
        recommendation: dto.recommendation?.trim() || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdByMembershipId: access.membership.id,
        updatedByMembershipId: access.membership.id,
      } });
      await this.activities.append(tx, { organizationId, findingId: finding.id, actorMembershipId: access.membership.id, type: FindingActivityType.PROMOTED_FROM_OBSERVATION, toStatus: FindingStatus.OPEN, metadata: { observationId } });
      return mapFinding(finding);
    });
  }

  private async transition(access: OrganizationAccess, findingId: string, next: FindingStatus, activityType: FindingActivityType, extra: Prisma.FindingUncheckedUpdateInput = {}, metadata?: Prisma.InputJsonValue) {
    const organizationId = this.organizationId(access);
    const current = await this.getRecord(access, findingId);
    if (!canTransitionFinding(current.status, next)) throw new ConflictException(`Invalid Finding lifecycle transition from ${current.status} to ${next}`);
    return this.prisma.$transaction(async (tx) => {
      const finding = await tx.finding.update({ where: { organizationId_id: { organizationId, id: findingId } }, data: { status: next, updatedByMembershipId: access.membership.id, ...extra } });
      await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: activityType, fromStatus: current.status, toStatus: next, ...(metadata === undefined ? {} : { metadata }) });
      return mapFinding(finding);
    });
  }

  private async allocateNumber(tx: Prisma.TransactionClient, organizationId: string, year: number) {
    const rows = await tx.$queryRaw<Array<{ allocated: number }>>`
      INSERT INTO "FindingSequence" ("organizationId", "year", "nextNumber")
      VALUES (${organizationId}::uuid, ${year}, 2)
      ON CONFLICT ("organizationId", "year")
      DO UPDATE SET "nextNumber" = "FindingSequence"."nextNumber" + 1
      RETURNING "nextNumber" - 1 AS allocated
    `;
    const allocated = rows[0]?.allocated;
    if (allocated === undefined) throw new ConflictException('Unable to allocate Finding number');
    return findingNumber(year, Number(allocated));
  }
}
