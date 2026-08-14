import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskActivityType, TaskSourceType, TaskStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { BlockTaskDto, CancelTaskDto, CompleteTaskDto, CreateFindingTaskDto, CreateTaskDto, ReopenTaskDto, TaskQueryDto, UpdateTaskDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TaskActivityService } from './task-activity.service';
import { mapFindingTaskSummary, mapTask, mapTaskSummary } from './task-presentation.utils';
import { canTransitionTask, taskNumber } from './tasks.utils';

const MANAGE_ROLES = [ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER];

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly activities: TaskActivityService) {}

  private organizationId(access: OrganizationAccess) { return access.organization.id; }
  private assertManage(access: OrganizationAccess) { if (!access.roleCodes.some((role) => MANAGE_ROLES.includes(role as (typeof MANAGE_ROLES)[number]))) throw new ForbiddenException('Not allowed to manage Tasks'); }
  private isManager(access: OrganizationAccess) { return access.roleCodes.some((role) => MANAGE_ROLES.includes(role as (typeof MANAGE_ROLES)[number])); }

  private async assertMembership(organizationId: string, membershipId: string | null | undefined, field: string, tx: Prisma.TransactionClient | PrismaService = this.prisma) {
    if (!membershipId) return;
    const membership = await tx.membership.findFirst({ where: { organizationId, id: membershipId, status: 'ACTIVE' }, select: { id: true } });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private include() {
    return {
      assigneeMembership: { include: { user: { select: { id: true, email: true } } } },
      finding: { select: { id: true, findingNumber: true, title: true, severity: true, status: true } },
    };
  }

  async getTask(access: OrganizationAccess, taskId: string, tx: PrismaService | Prisma.TransactionClient = this.prisma) {
    const task = await tx.task.findFirst({ where: { organizationId: this.organizationId(access), id: taskId }, include: this.include() });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private assertExecute(access: OrganizationAccess, task: { assigneeMembershipId: string | null }) {
    if (!this.isManager(access) && task.assigneeMembershipId !== access.membership.id) throw new ForbiddenException('Only the assigned Membership can execute this Task');
  }

  async list(access: OrganizationAccess, dto: TaskQueryDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const now = new Date();
    const and: Prisma.TaskWhereInput[] = [];
    if (dto.search) and.push({ OR: [{ taskNumber: { contains: dto.search, mode: 'insensitive' } }, { title: { contains: dto.search, mode: 'insensitive' } }, { description: { contains: dto.search, mode: 'insensitive' } }] });
    if (dto.dueBefore) and.push({ dueDate: { lte: new Date(dto.dueBefore) } });
    if (dto.dueAfter) and.push({ dueDate: { gte: new Date(dto.dueAfter) } });
    if (dto.overdue === true) and.push({ status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] }, dueDate: { lt: now } });
    if (dto.overdue === false) and.push({ OR: [{ status: { in: [TaskStatus.DONE, TaskStatus.CANCELLED] } }, { dueDate: null }, { dueDate: { gte: now } }] });
    if (dto.assignedToMe === true) and.push({ assigneeMembershipId: access.membership.id });
    const where: Prisma.TaskWhereInput = { organizationId, ...(dto.status ? { status: dto.status } : {}), ...(dto.priority ? { priority: dto.priority } : {}), ...(dto.assigneeMembershipId ? { assigneeMembershipId: dto.assigneeMembershipId } : {}), ...(dto.sourceType ? { sourceType: dto.sourceType } : {}), ...(dto.findingId ? { findingId: dto.findingId } : {}), ...(and.length ? { AND: and } : {}) };
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({ where, include: this.include(), orderBy: { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.task.count({ where }),
    ]);
    return { data: data.map((task) => mapTask(task, now)), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async summary(access: OrganizationAccess) {
    const tasks = await this.prisma.task.findMany({ where: { organizationId: this.organizationId(access) }, select: { status: true, priority: true, dueDate: true, assigneeMembershipId: true } });
    return mapTaskSummary(tasks, access.membership.id);
  }

  async findOne(access: OrganizationAccess, taskId: string) { return mapTask(await this.getTask(access, taskId)); }

  async create(access: OrganizationAccess, dto: CreateTaskDto) {
    this.assertManage(access);
    return this.createRecord(access, { ...dto, sourceType: TaskSourceType.MANUAL, findingId: null });
  }

  async createForFinding(access: OrganizationAccess, findingId: string, dto: CreateFindingTaskDto) {
    this.assertManage(access);
    const finding = await this.prisma.finding.findFirst({ where: { organizationId: this.organizationId(access), id: findingId }, select: { id: true, status: true } });
    if (!finding) throw new NotFoundException('Finding not found');
    if (![ 'OPEN', 'IN_REMEDIATION' ].includes(finding.status)) throw new ConflictException('Cannot create remediation Tasks for a closed or validation-ready Finding');
    return this.createRecord(access, { ...dto, sourceType: TaskSourceType.FINDING, findingId });
  }

  private async createRecord(access: OrganizationAccess, dto: CreateTaskDto & { sourceType: TaskSourceType; findingId: string | null }) {
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.assigneeMembershipId, 'assigneeMembershipId');
    return this.prisma.$transaction(async (tx) => {
      const number = await this.allocateNumber(tx, organizationId, new Date().getUTCFullYear());
      const task = await tx.task.create({ data: { organizationId, taskNumber: number, title: dto.title.trim(), description: dto.description?.trim() || null, priority: dto.priority, sourceType: dto.sourceType, findingId: dto.findingId, assigneeMembershipId: dto.assigneeMembershipId ?? null, dueDate: dto.dueDate ? new Date(dto.dueDate) : null, createdByMembershipId: access.membership.id, updatedByMembershipId: access.membership.id }, include: this.include() });
      await this.activities.append(tx, { organizationId, taskId: task.id, actorMembershipId: access.membership.id, type: TaskActivityType.CREATED, toStatus: TaskStatus.TODO });
      return mapTask(task);
    });
  }

  async update(access: OrganizationAccess, taskId: string, dto: UpdateTaskDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    const current = await this.getTask(access, taskId);
    if (current.status === TaskStatus.CANCELLED) throw new ConflictException('Cancelled Tasks cannot be modified');
    await this.assertMembership(organizationId, dto.assigneeMembershipId, 'assigneeMembershipId');
    const data: Prisma.TaskUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.assigneeMembershipId !== undefined) data.assigneeMembershipId = dto.assigneeMembershipId;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({ where: { organizationId_id: { organizationId, id: taskId } }, data, include: this.include() });
      await this.activities.append(tx, { organizationId, taskId, actorMembershipId: access.membership.id, type: TaskActivityType.UPDATED });
      if (dto.assigneeMembershipId !== undefined && dto.assigneeMembershipId !== current.assigneeMembershipId) await this.activities.append(tx, { organizationId, taskId, actorMembershipId: access.membership.id, type: current.assigneeMembershipId ? (dto.assigneeMembershipId ? TaskActivityType.REASSIGNED : TaskActivityType.UNASSIGNED) : TaskActivityType.ASSIGNED, metadata: { previousAssigneeMembershipId: current.assigneeMembershipId, newAssigneeMembershipId: dto.assigneeMembershipId } });
      if (dto.priority !== undefined && dto.priority !== current.priority) await this.activities.append(tx, { organizationId, taskId, actorMembershipId: access.membership.id, type: TaskActivityType.PRIORITY_CHANGED, metadata: { previousPriority: current.priority, newPriority: dto.priority } });
      if (dto.dueDate !== undefined && String(dto.dueDate ?? '') !== String(current.dueDate ?? '')) await this.activities.append(tx, { organizationId, taskId, actorMembershipId: access.membership.id, type: TaskActivityType.DUE_DATE_CHANGED });
      return mapTask(updated);
    });
  }

  async start(access: OrganizationAccess, taskId: string) { return this.executeTransition(access, taskId, TaskStatus.IN_PROGRESS, TaskActivityType.STARTED, (task) => { if (!task.assigneeMembershipId) throw new ConflictException('Cannot start an unassigned Task'); return { startedAt: task.startedAt ?? new Date() }; }); }
  async block(access: OrganizationAccess, taskId: string, dto: BlockTaskDto) { if (!dto.reason.trim()) throw new BadRequestException('Blocked reason is required'); return this.executeTransition(access, taskId, TaskStatus.BLOCKED, TaskActivityType.BLOCKED, () => ({ blockedReason: dto.reason.trim() }), ['TODO', 'IN_PROGRESS']); }
  async unblock(access: OrganizationAccess, taskId: string) { return this.executeTransition(access, taskId, TaskStatus.IN_PROGRESS, TaskActivityType.UNBLOCKED, (task) => { if (!task.assigneeMembershipId) throw new ConflictException('Cannot unblock an unassigned Task'); return { blockedReason: null }; }, ['BLOCKED']); }
  async complete(access: OrganizationAccess, taskId: string, dto: CompleteTaskDto) { return this.executeTransition(access, taskId, TaskStatus.DONE, TaskActivityType.COMPLETED, () => ({ completedAt: new Date(), completionNotes: dto.completionNotes?.trim() || null }), ['IN_PROGRESS']); }
  async reopen(access: OrganizationAccess, taskId: string, dto: ReopenTaskDto) { this.assertManage(access); if (!dto.reason.trim()) throw new BadRequestException('Reopen reason is required'); return this.executeTransition(access, taskId, TaskStatus.TODO, TaskActivityType.REOPENED, () => ({ completedAt: null }), ['DONE'], { reason: dto.reason.trim() }); }
  async cancel(access: OrganizationAccess, taskId: string, dto: CancelTaskDto) { this.assertManage(access); if (!dto.reason.trim()) throw new BadRequestException('Cancellation reason is required'); return this.executeTransition(access, taskId, TaskStatus.CANCELLED, TaskActivityType.CANCELLED, () => ({ cancelledAt: new Date(), cancellationReason: dto.reason.trim() }), ['TODO', 'IN_PROGRESS', 'BLOCKED'], { reason: dto.reason.trim() }); }

  private async executeTransition(access: OrganizationAccess, taskId: string, next: TaskStatus, activityType: TaskActivityType, changes: (task: any) => Prisma.TaskUncheckedUpdateInput, allowed?: string[], metadata?: Prisma.InputJsonValue) {
    const current = await this.getTask(access, taskId);
    this.assertExecute(access, current);
    const allowedStates = allowed ?? Object.keys({ [current.status]: true }).filter(() => canTransitionTask(current.status, next));
    if (!allowedStates.includes(current.status) || !canTransitionTask(current.status, next)) throw new ConflictException(`Invalid Task lifecycle transition from ${current.status} to ${next}`);
    const organizationId = this.organizationId(access);
    return this.prisma.$transaction(async (tx) => {
      const guarded = await tx.task.updateMany({ where: { organizationId, id: taskId, status: current.status }, data: { ...changes(current), updatedByMembershipId: access.membership.id } });
      if (guarded.count !== 1) throw new ConflictException('Task changed before the workflow operation could complete');
      const updated = await tx.task.findUniqueOrThrow({ where: { organizationId_id: { organizationId, id: taskId } }, include: this.include() });
      await this.activities.append(tx, { organizationId, taskId, actorMembershipId: access.membership.id, type: activityType, fromStatus: current.status, toStatus: next, ...(metadata ? { metadata } : {}) });
      return mapTask(updated);
    });
  }

  async findingTasks(access: OrganizationAccess, findingId: string, dto: TaskQueryDto) {
    const finding = await this.prisma.finding.findFirst({ where: { organizationId: this.organizationId(access), id: findingId }, select: { id: true } });
    if (!finding) throw new NotFoundException('Finding not found');
    return this.list(access, { ...dto, findingId });
  }

  async findingTaskSummary(access: OrganizationAccess, findingId: string) {
    const finding = await this.prisma.finding.findFirst({ where: { organizationId: this.organizationId(access), id: findingId }, select: { id: true } });
    if (!finding) throw new NotFoundException('Finding not found');
    const tasks = await this.prisma.task.findMany({ where: { organizationId: this.organizationId(access), findingId }, select: { status: true } });
    return mapFindingTaskSummary(tasks);
  }

  private async allocateNumber(tx: Prisma.TransactionClient, organizationId: string, year: number) {
    const rows = await tx.$queryRaw<Array<{ allocated: number }>>`
      INSERT INTO "TaskSequence" ("organizationId", "year", "nextNumber") VALUES (${organizationId}::uuid, ${year}, 2)
      ON CONFLICT ("organizationId", "year") DO UPDATE SET "nextNumber" = "TaskSequence"."nextNumber" + 1
      RETURNING "nextNumber" - 1 AS allocated
    `;
    if (rows[0]?.allocated === undefined) throw new ConflictException('Unable to allocate Task number');
    return taskNumber(year, Number(rows[0].allocated));
  }
}
