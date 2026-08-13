import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditStatus, AuditTestStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CompleteAuditTestDto, CreateAuditTestDto, ListAuditTestsDto, UpdateAuditTestDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditScopeService } from './audit-scope.service';
import { canTransitionAuditTest } from './audits.utils';

@Injectable()
export class AuditTestsService {
  constructor(private readonly prisma: PrismaService, private readonly audits: AuditsService, private readonly scopes: AuditScopeService) {}

  private member(member: any) { return member ? { id: member.id, name: member.user?.email ?? member.id } : null; }
  private mapTest(test: any) { return { id: test.id, organizationId: test.organizationId, auditId: test.auditId, code: test.code, title: test.title, description: test.description, controlId: test.controlId, organizationRequirementId: test.organizationRequirementId, procedure: test.procedure, expectedResult: test.expectedResult, status: test.status, result: test.result, assignedTo: this.member(test.assignedToMembership), assignedToMembershipId: test.assignedToMembershipId, startedAt: test.startedAt, completedAt: test.completedAt, notes: test.notes, createdByMembershipId: test.createdByMembershipId, updatedByMembershipId: test.updatedByMembershipId, createdAt: test.createdAt, updatedAt: test.updatedAt }; }

  private async getRecord(access: OrganizationAccess, auditTestId: string) {
    const test = await this.prisma.auditTest.findFirst({ where: { organizationId: this.audits.organizationId(access), id: auditTestId }, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } }, control: true, organizationRequirement: true, evidenceLinks: { include: { evidence: true, evidenceVersion: true } }, observations: { orderBy: { createdAt: 'asc' } } } });
    if (!test) throw new NotFoundException('Audit Test not found'); return test;
  }

  async assertMutable(access: OrganizationAccess, auditTestId: string) {
    const test = await this.getRecord(access, auditTestId); const audit = await this.audits.getAuditRecord(access, test.auditId);
    if (audit.status === AuditStatus.COMPLETED || audit.status === AuditStatus.CANCELLED || test.status === AuditTestStatus.COMPLETED) throw new ConflictException('This Audit Test cannot be modified');
    return { test, audit };
  }

  async list(access: OrganizationAccess, auditId: string, dto: ListAuditTestsDto) {
    await this.audits.getAuditRecord(access, auditId); const organizationId = this.audits.organizationId(access); const page = dto.page ?? 1; const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.AuditTestWhereInput = { organizationId, auditId, ...(dto.status ? { status: dto.status } : {}), ...(dto.result ? { result: dto.result } : {}), ...(dto.assignedToMembershipId ? { assignedToMembershipId: dto.assignedToMembershipId } : {}), ...(dto.controlId ? { controlId: dto.controlId } : {}), ...(dto.organizationRequirementId ? { organizationRequirementId: dto.organizationRequirementId } : {}), ...(dto.search ? { OR: [{ code: { contains: dto.search, mode: 'insensitive' } }, { title: { contains: dto.search, mode: 'insensitive' } }, { description: { contains: dto.search, mode: 'insensitive' } }] } : {}) };
    const [tests, total] = await Promise.all([this.prisma.auditTest.findMany({ where, orderBy: { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { assignedToMembership: { include: { user: { select: { id: true, email: true } } } } } }), this.prisma.auditTest.count({ where })]);
    return { data: tests.map((test) => this.mapTest(test)), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async create(access: OrganizationAccess, auditId: string, dto: CreateAuditTestDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); const audit = await this.audits.assertMutable(access, auditId); await this.audits.assertMembership(organizationId, dto.assignedToMembershipId, 'assignedToMembershipId');
    if (dto.controlId && !(await this.scopes.isTargetInScope(access, auditId, dto.controlId))) throw new ConflictException('Control is outside the Audit scope');
    if (dto.organizationRequirementId && !(await this.scopes.isTargetInScope(access, auditId, undefined, dto.organizationRequirementId))) throw new ConflictException('Requirement is outside the Audit scope');
    if (dto.controlId && !(await this.prisma.control.findFirst({ where: { organizationId, id: dto.controlId } }))) throw new NotFoundException('Control not found');
    if (dto.organizationRequirementId && !(await this.prisma.organizationRequirement.findFirst({ where: { organizationId, id: dto.organizationRequirementId } }))) throw new NotFoundException('Organization requirement not found');
    try { const test = await this.prisma.auditTest.create({ data: { organizationId, auditId: audit.id, code: dto.code.trim(), title: dto.title.trim(), description: dto.description?.trim() || null, controlId: dto.controlId ?? null, organizationRequirementId: dto.organizationRequirementId ?? null, procedure: dto.procedure.trim(), expectedResult: dto.expectedResult.trim(), assignedToMembershipId: dto.assignedToMembershipId ?? null, notes: dto.notes?.trim() || null, createdByMembershipId: access.membership.id, updatedByMembershipId: access.membership.id } }); return this.mapTest(test); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Audit Test code is already used in this Audit'); throw error; }
  }

  async findOne(access: OrganizationAccess, auditTestId: string) { return this.mapTest(await this.getRecord(access, auditTestId)); }

  async update(access: OrganizationAccess, auditTestId: string, dto: UpdateAuditTestDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.assertMutable(access, auditTestId); await this.audits.assertMembership(organizationId, dto.assignedToMembershipId, 'assignedToMembershipId');
    const data: Prisma.AuditTestUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    if (dto.title !== undefined) data.title = dto.title.trim(); if (dto.description !== undefined) data.description = dto.description.trim() || null; if (dto.procedure !== undefined) data.procedure = dto.procedure.trim(); if (dto.expectedResult !== undefined) data.expectedResult = dto.expectedResult.trim(); if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null; if (dto.assignedToMembershipId !== undefined) data.assignedToMembershipId = dto.assignedToMembershipId;
    await this.prisma.auditTest.update({ where: { organizationId_id: { organizationId, id: auditTestId } }, data }); return this.findOne(access, auditTestId);
  }

  async transition(access: OrganizationAccess, auditTestId: string, next: AuditTestStatus, complete?: CompleteAuditTestDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); const { test } = await this.assertMutable(access, auditTestId);
    if (!canTransitionAuditTest(test.status, next)) throw new ConflictException(`Audit Test cannot transition from ${test.status} to ${next}`);
    if (next === AuditTestStatus.COMPLETED && !complete?.result) throw new BadRequestException('A result is required to complete an Audit Test');
    const data: Prisma.AuditTestUncheckedUpdateInput = { status: next, updatedByMembershipId: access.membership.id, ...(next === AuditTestStatus.IN_PROGRESS ? { startedAt: new Date() } : {}), ...(next === AuditTestStatus.COMPLETED ? { completedAt: new Date(), result: complete!.result } : {}) };
    return this.mapTest(await this.prisma.auditTest.update({ where: { organizationId_id: { organizationId, id: auditTestId } }, data }));
  }
}
