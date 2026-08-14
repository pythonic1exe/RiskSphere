import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ControlExecutionStatus, ControlStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import { canTransitionControlExecution, isExecutionOverdue, nextControlCode } from './controls.utils';
import { controlAttentionReason, controlSummaryWindow } from './controls-summary.utils';
import type { CompleteControlExecutionDto, CreateControlDto, CreateControlExecutionDto, ListControlsDto, UpdateControlDto, UpdateControlExecutionDto } from './dto';

const CONTROL_WRITE_ROLES = [
  ORGANIZATION_ROLE_CODES.OWNER,
  ORGANIZATION_ROLE_CODES.GRC_ADMIN,
  ORGANIZATION_ROLE_CODES.RISK_MANAGER,
  ORGANIZATION_ROLE_CODES.CONTROL_OWNER,
];

@Injectable()
export class ControlsService {
  constructor(private readonly prisma: PrismaService) {}

  private organizationId(access: OrganizationAccess) { return access.organization.id; }

  private assertWriteAccess(access: OrganizationAccess) {
    if (!access.roleCodes.some((role) => CONTROL_WRITE_ROLES.includes(role as (typeof CONTROL_WRITE_ROLES)[number]))) {
      throw new ForbiddenException('Not allowed to manage controls');
    }
  }

  private async assertMembership(organizationId: string, membershipId: string | undefined, field: string) {
    if (!membershipId) return;
    const membership = await this.prisma.membership.findFirst({ where: { id: membershipId, organizationId, status: 'ACTIVE' }, select: { id: true } });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private async getControl(access: OrganizationAccess, controlId: string) {
    const control = await this.prisma.control.findFirst({
      where: { id: controlId, organizationId: this.organizationId(access) },
      include: {
        ownerMembership: { include: { user: { select: { id: true, email: true } } } },
        executions: { orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }], take: 10, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } },
        riskControls: { include: { risk: { select: { id: true, code: true, title: true, status: true } } } },
      },
    });
    if (!control) throw new NotFoundException('Control not found');
    return this.mapControl(control);
  }

  private member(member: { id: string; user?: { id: string; email: string } } | null | undefined) {
    return member ? { id: member.id, name: member.user?.email ?? member.id } : null;
  }

  private mapExecution(execution: any) {
    return {
      id: execution.id,
      controlId: execution.controlId,
      periodLabel: execution.periodLabel,
      periodStart: execution.periodStart,
      periodEnd: execution.periodEnd,
      dueAt: execution.dueAt,
      status: execution.status,
      isOverdue: isExecutionOverdue(execution.dueAt, execution.status),
      assignedTo: this.member(execution.assignedToMembership),
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      completedByMembershipId: execution.completedByMembershipId,
      completionNotes: execution.completionNotes,
      createdByMembershipId: execution.createdByMembershipId,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    };
  }

  private mapControl(control: any) {
    const executions = control.executions ?? [];
    const nextExecution = executions.find((execution: any) => ![ControlExecutionStatus.COMPLETED, ControlExecutionStatus.CANCELLED].includes(execution.status)) ?? null;
    return {
      id: control.id,
      organizationId: control.organizationId,
      code: control.code,
      title: control.title,
      description: control.description,
      category: control.category,
      type: control.type,
      automationType: control.automationType,
      frequency: control.frequency,
      status: control.status,
      owner: this.member(control.ownerMembership),
      createdByMembershipId: control.createdByMembershipId,
      updatedByMembershipId: control.updatedByMembershipId,
      createdAt: control.createdAt,
      updatedAt: control.updatedAt,
      archivedAt: control.archivedAt,
      linkedRiskCount: control._count?.riskControls ?? control.riskControls?.length ?? 0,
      linkedRisks: control.riskControls?.map((link: any) => link.risk) ?? [],
      nextExecution: nextExecution ? this.mapExecution(nextExecution) : null,
      recentExecutions: executions.map((execution: any) => this.mapExecution(execution)),
    };
  }

  async list(access: OrganizationAccess, dto: ListControlsDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.ControlWhereInput = {
      organizationId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.automationType ? { automationType: dto.automationType } : {}),
      ...(dto.frequency ? { frequency: dto.frequency } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(dto.riskId ? { riskControls: { some: { organizationId, riskId: dto.riskId } } } : {}),
      ...(dto.search ? { OR: [{ title: { contains: dto.search, mode: 'insensitive' } }, { code: { contains: dto.search, mode: 'insensitive' } }, { description: { contains: dto.search, mode: 'insensitive' } }, { category: { contains: dto.search, mode: 'insensitive' } }] } : {}),
    };
    const orderBy: Prisma.ControlOrderByWithRelationInput = { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' };
    const [controls, total] = await Promise.all([
      this.prisma.control.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          ownerMembership: { include: { user: { select: { id: true, email: true } } } },
          _count: { select: { riskControls: true } },
          executions: { where: { status: { notIn: [ControlExecutionStatus.COMPLETED, ControlExecutionStatus.CANCELLED] } }, orderBy: { dueAt: 'asc' }, take: 1, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } },
        },
      }),
      this.prisma.control.count({ where }),
    ]);
    return { data: controls.map((control) => this.mapControl(control)), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async summary(access: OrganizationAccess) {
    const organizationId = this.organizationId(access);
    const now = new Date();
    const { to } = controlSummaryWindow(now);
    const openExecutionWhere: Prisma.ControlExecutionWhereInput = { organizationId, status: { notIn: [ControlExecutionStatus.COMPLETED, ControlExecutionStatus.CANCELLED] } };
    const [total, active, overdueExecutions, dueSoon, unscheduled, openExecutions, completedExecutions, attention] = await Promise.all([
      this.prisma.control.count({ where: { organizationId } }),
      this.prisma.control.count({ where: { organizationId, status: ControlStatus.ACTIVE } }),
      this.prisma.controlExecution.count({ where: { ...openExecutionWhere, dueAt: { lt: now } } }),
      this.prisma.controlExecution.count({ where: { ...openExecutionWhere, dueAt: { gte: now, lte: to } } }),
      this.prisma.control.count({ where: { organizationId, status: ControlStatus.ACTIVE, executions: { none: {} } } }),
      this.prisma.controlExecution.count({ where: openExecutionWhere }),
      this.prisma.controlExecution.count({ where: { organizationId, status: ControlExecutionStatus.COMPLETED } }),
      this.prisma.controlExecution.findMany({
        where: { ...openExecutionWhere, dueAt: { lte: to } }, orderBy: { dueAt: 'asc' }, take: 8,
        include: { control: { select: { code: true, title: true } } },
      }),
    ]);
    return {
      total, active, overdueExecutions, dueSoon, unscheduled, openExecutions, completedExecutions,
      attention: attention.map((execution) => ({ id: execution.id, controlId: execution.controlId, code: execution.control.code, title: execution.control.title, periodLabel: execution.periodLabel, dueAt: execution.dueAt, status: execution.status, reason: controlAttentionReason(execution, now) ?? 'Operational attention' })),
    };
  }

  async create(access: OrganizationAccess, dto: CreateControlDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${organizationId}::uuid FOR UPDATE`;
      const existing = await tx.control.findMany({ where: { organizationId }, select: { code: true } });
      const code = nextControlCode(existing.map((item) => item.code));
      return tx.control.create({ data: { organizationId, code, title: dto.title.trim(), description: dto.description?.trim() || null, category: dto.category?.trim() || null, type: dto.type, automationType: dto.automationType, frequency: dto.frequency, ownerMembershipId: dto.ownerMembershipId ?? null, createdByMembershipId: access.membership.id, updatedByMembershipId: access.membership.id } });
    });
  }

  async findOne(access: OrganizationAccess, controlId: string) { return this.getControl(access, controlId); }

  async update(access: OrganizationAccess, controlId: string, dto: UpdateControlDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { id: controlId, organizationId } });
    if (!control) throw new NotFoundException('Control not found');
    if (control.status === ControlStatus.ARCHIVED) throw new ConflictException('Archived controls cannot be updated');
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    const data: Prisma.ControlUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    for (const field of ['type', 'automationType', 'frequency', 'ownerMembershipId'] as const) if (dto[field] !== undefined) data[field] = dto[field] as never;
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim() || null;
    if (dto.category !== undefined) data.category = dto.category.trim() || null;
    return this.prisma.control.update({ where: { organizationId_id: { organizationId, id: controlId } }, data });
  }

  async activate(access: OrganizationAccess, controlId: string) { return this.changeStatus(access, controlId, ControlStatus.ACTIVE, [ControlStatus.DRAFT]); }
  async retire(access: OrganizationAccess, controlId: string) { return this.changeStatus(access, controlId, ControlStatus.RETIRED, [ControlStatus.ACTIVE]); }
  async archive(access: OrganizationAccess, controlId: string) { return this.changeStatus(access, controlId, ControlStatus.ARCHIVED, [ControlStatus.RETIRED]); }

  private async changeStatus(access: OrganizationAccess, controlId: string, status: ControlStatus, allowed: ControlStatus[]) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { id: controlId, organizationId } });
    if (!control) throw new NotFoundException('Control not found');
    if (!allowed.includes(control.status)) throw new ConflictException(`Control cannot transition from ${control.status} to ${status}`);
    return this.prisma.control.update({ where: { organizationId_id: { organizationId, id: controlId } }, data: { status, archivedAt: status === ControlStatus.ARCHIVED ? new Date() : null, updatedByMembershipId: access.membership.id } });
  }

  private async getControlRecord(access: OrganizationAccess, controlId: string) {
    const control = await this.prisma.control.findFirst({ where: { id: controlId, organizationId: this.organizationId(access) } });
    if (!control) throw new NotFoundException('Control not found');
    return control;
  }

  private validateDates(periodStart: Date, periodEnd: Date, dueAt: Date) {
    if (periodStart > periodEnd) throw new BadRequestException('periodStart must be before or equal to periodEnd');
    if (dueAt < periodStart) throw new BadRequestException('dueAt must be on or after periodStart');
  }

  async listExecutions(access: OrganizationAccess, controlId: string) {
    await this.getControlRecord(access, controlId);
    const executions = await this.prisma.controlExecution.findMany({ where: { organizationId: this.organizationId(access), controlId }, orderBy: [{ periodStart: 'desc' }, { createdAt: 'desc' }], include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } });
    return { data: executions.map((execution) => this.mapExecution(execution)), pagination: { page: 1, pageSize: executions.length, total: executions.length, totalPages: executions.length ? 1 : 0 } };
  }

  async createExecution(access: OrganizationAccess, controlId: string, dto: CreateControlExecutionDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const control = await this.getControlRecord(access, controlId);
    if (control.status === ControlStatus.RETIRED || control.status === ControlStatus.ARCHIVED) throw new ConflictException('Retired or archived controls cannot receive new executions');
    await this.assertMembership(organizationId, dto.assignedToMembershipId, 'assignedToMembershipId');
    const periodStart = new Date(dto.periodStart); const periodEnd = new Date(dto.periodEnd); const dueAt = new Date(dto.dueAt);
    this.validateDates(periodStart, periodEnd, dueAt);
    const execution = await this.prisma.controlExecution.create({ data: { organizationId, controlId, periodLabel: dto.periodLabel.trim(), periodStart, periodEnd, dueAt, assignedToMembershipId: dto.assignedToMembershipId ?? null, createdByMembershipId: access.membership.id }, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } });
    return this.mapExecution(execution);
  }

  async getExecution(access: OrganizationAccess, controlId: string, executionId: string) {
    await this.getControlRecord(access, controlId);
    const execution = await this.prisma.controlExecution.findFirst({ where: { id: executionId, controlId, organizationId: this.organizationId(access) }, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } });
    if (!execution) throw new NotFoundException('Control execution not found');
    return this.mapExecution(execution);
  }

  async updateExecution(access: OrganizationAccess, controlId: string, executionId: string, dto: UpdateControlExecutionDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const execution = await this.prisma.controlExecution.findFirst({ where: { id: executionId, controlId, organizationId } });
    if (!execution) throw new NotFoundException('Control execution not found');
    if (([ControlExecutionStatus.COMPLETED, ControlExecutionStatus.CANCELLED] as ControlExecutionStatus[]).includes(execution.status)) throw new ConflictException('Completed or cancelled executions cannot be updated');
    await this.assertMembership(organizationId, dto.assignedToMembershipId, 'assignedToMembershipId');
    const periodStart = dto.periodStart ? new Date(dto.periodStart) : execution.periodStart;
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : execution.periodEnd;
    const dueAt = dto.dueAt ? new Date(dto.dueAt) : execution.dueAt;
    this.validateDates(periodStart, periodEnd, dueAt);
    const data: Prisma.ControlExecutionUncheckedUpdateInput = { periodStart, periodEnd, dueAt };
    if (dto.periodLabel !== undefined) data.periodLabel = dto.periodLabel.trim();
    if (dto.assignedToMembershipId !== undefined) data.assignedToMembershipId = dto.assignedToMembershipId;
    if (dto.completionNotes !== undefined) data.completionNotes = dto.completionNotes.trim() || null;
    const updated = await this.prisma.controlExecution.update({ where: { organizationId_id: { organizationId, id: executionId } }, data, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } });
    return this.mapExecution(updated);
  }

  async startExecution(access: OrganizationAccess, controlId: string, executionId: string) { return this.transitionExecution(access, controlId, executionId, ControlExecutionStatus.IN_PROGRESS); }

  async completeExecution(access: OrganizationAccess, controlId: string, executionId: string, dto: CompleteControlExecutionDto) {
    this.assertWriteAccess(access);
    return this.transitionExecution(access, controlId, executionId, ControlExecutionStatus.COMPLETED, { completionNotes: dto.completionNotes?.trim() || null, completedAt: new Date(), completedByMembershipId: access.membership.id });
  }

  async cancelExecution(access: OrganizationAccess, controlId: string, executionId: string) { return this.transitionExecution(access, controlId, executionId, ControlExecutionStatus.CANCELLED); }

  private async transitionExecution(access: OrganizationAccess, controlId: string, executionId: string, status: ControlExecutionStatus, extra: Prisma.ControlExecutionUncheckedUpdateInput = {}) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.getControlRecord(access, controlId);
    const execution = await this.prisma.controlExecution.findFirst({ where: { id: executionId, controlId, organizationId } });
    if (!execution) throw new NotFoundException('Control execution not found');
    if (!canTransitionControlExecution(execution.status, status)) throw new ConflictException(`Execution cannot transition from ${execution.status} to ${status}`);
    const updated = await this.prisma.controlExecution.update({ where: { organizationId_id: { organizationId, id: executionId } }, data: { status, ...(status === ControlExecutionStatus.IN_PROGRESS ? { startedAt: new Date() } : {}), ...extra }, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } });
    return this.mapExecution(updated);
  }

  async listRisks(access: OrganizationAccess, controlId: string) {
    await this.getControlRecord(access, controlId);
    const links = await this.prisma.riskControl.findMany({ where: { organizationId: this.organizationId(access), controlId }, include: { risk: true }, orderBy: { createdAt: 'desc' } });
    return { data: links.map((link) => link.risk) };
  }

  async linkRisk(access: OrganizationAccess, controlId: string, riskId: string) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const control = await this.getControlRecord(access, controlId);
    if (control.status === ControlStatus.ARCHIVED) throw new ConflictException('Archived controls cannot link risks');
    const risk = await this.prisma.risk.findFirst({ where: { id: riskId, organizationId }, select: { id: true, status: true } });
    if (!risk) throw new NotFoundException('Risk not found');
    if (risk.status === 'ARCHIVED') throw new ConflictException('Archived risks cannot be linked');
    try { return await this.prisma.riskControl.create({ data: { organizationId, controlId, riskId, createdByMembershipId: access.membership.id } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Risk is already linked to this control'); throw error; }
  }

  async unlinkRisk(access: OrganizationAccess, controlId: string, riskId: string) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.getControlRecord(access, controlId);
    const link = await this.prisma.riskControl.findFirst({ where: { organizationId, controlId, riskId } });
    if (!link) throw new NotFoundException('Risk link not found');
    await this.prisma.riskControl.delete({ where: { organizationId_id: { organizationId, id: link.id } } });
    return { deleted: true };
  }

  async listControlsForRisk(access: OrganizationAccess, riskId: string) {
    const risk = await this.prisma.risk.findFirst({ where: { id: riskId, organizationId: this.organizationId(access) }, select: { id: true } });
    if (!risk) throw new NotFoundException('Risk not found');
    const links = await this.prisma.riskControl.findMany({ where: { organizationId: this.organizationId(access), riskId }, include: { control: true }, orderBy: { createdAt: 'desc' } });
    return { data: links.map((link) => link.control) };
  }
}
