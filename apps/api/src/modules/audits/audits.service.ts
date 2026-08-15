import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditStatus, AuditTestStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateAuditDto, ListAuditsDto, UpdateAuditDto } from './dto';
import { canTransitionAudit, hasMeaningfulAuditScope } from './audits.utils';
import { summarizeAuditTests } from './audit-presentation.utils';

const AUDIT_SUMMARY_HORIZON_DAYS = 30;

const AUDIT_WRITE_ROLES = [
  ORGANIZATION_ROLE_CODES.OWNER,
  ORGANIZATION_ROLE_CODES.GRC_ADMIN,
  ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
];

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  organizationId(access: OrganizationAccess) {
    return access.organization.id;
  }

  assertManage(access: OrganizationAccess) {
    if (
      !access.roleCodes.some((role) =>
        AUDIT_WRITE_ROLES.includes(role as (typeof AUDIT_WRITE_ROLES)[number]),
      )
    )
      throw new ForbiddenException('Not allowed to manage audits');
  }

  async assertMembership(
    organizationId: string,
    membershipId: string | null | undefined,
    field: string,
  ) {
    if (!membershipId) return;
    const membership = await this.prisma.membership.findFirst({
      where: { organizationId, id: membershipId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!membership)
      throw new BadRequestException(`${field} must be an active organization membership`);
  }

  async getAuditRecord(access: OrganizationAccess, auditId: string) {
    const audit = await this.prisma.audit.findFirst({
      where: { organizationId: this.organizationId(access), id: auditId },
      include: {
        leadAuditorMembership: { include: { user: { select: { id: true, email: true } } } },
        createdByMembership: { include: { user: { select: { id: true, email: true } } } },
        updatedByMembership: { include: { user: { select: { id: true, email: true } } } },
        members: {
          orderBy: { addedAt: 'asc' },
          include: { membership: { include: { user: { select: { id: true, email: true } } } } },
        },
        scopes: {
          orderBy: { createdAt: 'asc' },
          include: { organizationFramework: true, organizationRequirement: true, control: true },
        },
        tests: {
          orderBy: { createdAt: 'asc' },
          include: {
            assignedToMembership: { include: { user: { select: { id: true, email: true } } } },
          },
        },
      },
    });
    if (!audit) throw new NotFoundException('Audit not found');
    return audit;
  }

  async assertMutable(access: OrganizationAccess, auditId: string) {
    const audit = await this.getAuditRecord(access, auditId);
    if (audit.status === AuditStatus.COMPLETED || audit.status === AuditStatus.CANCELLED)
      throw new ConflictException(`Audit is ${audit.status.toLowerCase()} and cannot be modified`);
    return audit;
  }

  private member(member: any) {
    return member ? { id: member.id, name: member.user?.email ?? member.id } : null;
  }
  mapAudit(audit: any) {
    const testSummary = summarizeAuditTests(audit.tests ?? []);
    return {
      id: audit.id,
      organizationId: audit.organizationId,
      code: audit.code,
      title: audit.title,
      description: audit.description,
      type: audit.type,
      status: audit.status,
      leadAuditor: this.member(audit.leadAuditorMembership),
      leadAuditorMembershipId: audit.leadAuditorMembershipId,
      createdBy: this.member(audit.createdByMembership),
      updatedBy: this.member(audit.updatedByMembership),
      plannedStartAt: audit.plannedStartAt,
      plannedEndAt: audit.plannedEndAt,
      startedAt: audit.startedAt,
      completedAt: audit.completedAt,
      cancelledAt: audit.cancelledAt,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
      counts: {
        members: audit._count?.members ?? audit.members?.length ?? 0,
        scopes: audit._count?.scopes ?? audit.scopes?.length ?? 0,
        tests: audit._count?.tests ?? testSummary.total,
      },
      testSummary,
      members:
        audit.members?.map((item: any) => ({
          id: item.id,
          membershipId: item.membershipId,
          role: item.role,
          addedAt: item.addedAt,
          member: this.member(item.membership),
        })) ?? [],
      scopes:
        audit.scopes?.map((scope: any) => ({
          id: scope.id,
          type: scope.type,
          organizationFrameworkId: scope.organizationFrameworkId,
          organizationRequirementId: scope.organizationRequirementId,
          controlId: scope.controlId,
          framework: scope.organizationFramework,
          requirement: scope.organizationRequirement,
          control: scope.control,
          createdAt: scope.createdAt,
        })) ?? [],
      tests:
        audit.tests?.map((test: any) => ({
          id: test.id,
          code: test.code,
          title: test.title,
          status: test.status,
          result: test.result,
          controlId: test.controlId,
          organizationRequirementId: test.organizationRequirementId,
          assignedTo: this.member(test.assignedToMembership),
          startedAt: test.startedAt,
          completedAt: test.completedAt,
        })) ?? [],
    };
  }

  async list(access: OrganizationAccess, dto: ListAuditsDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.AuditWhereInput = {
      organizationId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.leadAuditorMembershipId
        ? { leadAuditorMembershipId: dto.leadAuditorMembershipId }
        : {}),
      ...(dto.memberMembershipId
        ? { members: { some: { organizationId, membershipId: dto.memberMembershipId } } }
        : {}),
      ...(dto.plannedStartBefore
        ? { plannedStartAt: { lte: new Date(dto.plannedStartBefore) } }
        : {}),
      ...(dto.plannedEndAfter ? { plannedEndAt: { gte: new Date(dto.plannedEndAfter) } } : {}),
      ...(dto.search
        ? {
            OR: [
              { code: { contains: dto.search, mode: 'insensitive' } },
              { title: { contains: dto.search, mode: 'insensitive' } },
              { description: { contains: dto.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [audits, total] = await Promise.all([
      this.prisma.audit.findMany({
        where,
        orderBy: { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          leadAuditorMembership: { include: { user: { select: { id: true, email: true } } } },
          createdByMembership: { include: { user: { select: { id: true, email: true } } } },
          tests: { select: { id: true, status: true, result: true } },
          _count: { select: { members: true, scopes: true, tests: true } },
        },
      }),
      this.prisma.audit.count({ where }),
    ]);
    return {
      data: audits.map((audit) => this.mapAudit(audit)),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async summary(access: OrganizationAccess, now = new Date()) {
    const organizationId = this.organizationId(access);
    const counts = await Promise.all([
      ...Object.values(AuditStatus).map((status) => this.prisma.audit.count({ where: { organizationId, status } })),
      this.prisma.audit.count({ where: { organizationId, status: { not: AuditStatus.CANCELLED }, plannedStartAt: { gte: now, lte: new Date(now.getTime() + AUDIT_SUMMARY_HORIZON_DAYS * 24 * 60 * 60 * 1000) } } }),
    ]);
    const [draft = 0, planned = 0, inProgress = 0, underReview = 0, completed = 0, cancelled = 0, upcoming = 0] = counts;
    return { total: draft + planned + inProgress + underReview + completed + cancelled, draft, planned, inProgress, underReview, completed, cancelled, upcoming };
  }

  async create(access: OrganizationAccess, dto: CreateAuditDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    await this.assertMembership(
      organizationId,
      dto.leadAuditorMembershipId,
      'leadAuditorMembershipId',
    );
    if (
      dto.plannedStartAt &&
      dto.plannedEndAt &&
      new Date(dto.plannedStartAt) > new Date(dto.plannedEndAt)
    )
      throw new BadRequestException('plannedStartAt must be before or equal to plannedEndAt');
    try {
      const audit = await this.prisma.audit.create({
        data: {
          organizationId,
          code: dto.code.trim(),
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          type: dto.type,
          leadAuditorMembershipId: dto.leadAuditorMembershipId ?? null,
          plannedStartAt: dto.plannedStartAt ? new Date(dto.plannedStartAt) : null,
          plannedEndAt: dto.plannedEndAt ? new Date(dto.plannedEndAt) : null,
          createdByMembershipId: access.membership.id,
          updatedByMembershipId: access.membership.id,
        },
      });
      return this.mapAudit(audit);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002')
        throw new ConflictException('Audit code is already used in this organization');
      throw error;
    }
  }

  async findOne(access: OrganizationAccess, auditId: string) {
    return this.mapAudit(await this.getAuditRecord(access, auditId));
  }

  async update(access: OrganizationAccess, auditId: string, dto: UpdateAuditDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    const audit = await this.assertMutable(access, auditId);
    await this.assertMembership(
      organizationId,
      dto.leadAuditorMembershipId,
      'leadAuditorMembershipId',
    );
    if (
      dto.plannedStartAt &&
      dto.plannedEndAt &&
      new Date(dto.plannedStartAt) > new Date(dto.plannedEndAt)
    )
      throw new BadRequestException('plannedStartAt must be before or equal to plannedEndAt');
    const data: Prisma.AuditUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim() || null;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.leadAuditorMembershipId !== undefined)
      data.leadAuditorMembershipId = dto.leadAuditorMembershipId;
    if (dto.plannedStartAt !== undefined)
      data.plannedStartAt = dto.plannedStartAt ? new Date(dto.plannedStartAt) : null;
    if (dto.plannedEndAt !== undefined)
      data.plannedEndAt = dto.plannedEndAt ? new Date(dto.plannedEndAt) : null;
    await this.prisma.audit.update({
      where: { organizationId_id: { organizationId, id: audit.id } },
      data,
    });
    return this.findOne(access, auditId);
  }

  async transition(access: OrganizationAccess, auditId: string, next: AuditStatus) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    return this.prisma.$transaction(async (tx) => {
      const audit = await tx.audit.findFirst({
        where: { organizationId, id: auditId },
        include: {
          scopes: { select: { id: true } },
          tests: { select: { status: true, result: true } },
        },
      });
      if (!audit) throw new NotFoundException('Audit not found');
      if (!canTransitionAudit(audit.status, next))
        throw new ConflictException(`Audit cannot transition from ${audit.status} to ${next}`);
      if (next === AuditStatus.IN_PROGRESS && !hasMeaningfulAuditScope(audit.scopes.length))
        throw new ConflictException('Audit requires at least one scope item before it can start');
      if (
        next === AuditStatus.COMPLETED &&
        (audit.tests.length === 0 ||
          audit.tests.some((test) => test.status !== AuditTestStatus.COMPLETED || !test.result))
      )
        throw new ConflictException(
          'All Audit Tests must be completed with a result before the Audit can be completed',
        );
      const updated = await tx.audit.update({
        where: { organizationId_id: { organizationId, id: auditId } },
        data: {
          status: next,
          ...(next === AuditStatus.IN_PROGRESS ? { startedAt: new Date() } : {}),
          ...(next === AuditStatus.COMPLETED ? { completedAt: new Date() } : {}),
          ...(next === AuditStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
          updatedByMembershipId: access.membership.id,
        },
      });
      return this.mapAudit(updated);
    });
  }
}
