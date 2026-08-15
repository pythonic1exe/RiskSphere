import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ControlStatus, OrganizationFrameworkStatus, OrganizationRequirementStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationAuthorizationService } from '../../common/authorization';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import { calculateComplianceSummary, validateAssessmentRationale } from './compliance.utils';
import type { AdoptFrameworkDto, CreateRequirementAssessmentDto, ListComplianceFrameworksDto, ListRequirementsDto, UpdateOrganizationRequirementDto } from './dto';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: OrganizationAuthorizationService,
  ) {}

  private organizationId(access: OrganizationAccess) {
    return access.organization.id;
  }

  private assertManage(access: OrganizationAccess) {
    if (!this.authorizationService.canManageCompliance(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to manage compliance');
    }
  }

  private async assertMembership(organizationId: string, membershipId: string | null | undefined, field: string) {
    if (!membershipId) return;
    const membership = await this.prisma.membership.findFirst({
      where: { organizationId, id: membershipId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private member(membership: { id: string; user?: { email: string } } | null | undefined) {
    return membership ? { id: membership.id, name: membership.user?.email ?? membership.id } : null;
  }

  private async getFrameworkRecord(access: OrganizationAccess, organizationFrameworkId: string) {
    const framework = await this.prisma.organizationFramework.findFirst({
      where: { id: organizationFrameworkId, organizationId: this.organizationId(access) },
      include: {
        frameworkCatalog: true,
        ownerMembership: { include: { user: { select: { email: true } } } },
        requirements: {
          select: {
            status: true,
            controlLinks: { select: { id: true } },
          },
        },
      },
    });
    if (!framework) throw new NotFoundException('Organization framework not found');
    return framework;
  }

  private assertActiveFramework(framework: { status: OrganizationFrameworkStatus }) {
    if (framework.status === OrganizationFrameworkStatus.ARCHIVED) {
      throw new ConflictException('Archived frameworks cannot be modified');
    }
  }

  private mapFramework(framework: any) {
    const statuses = (framework.requirements ?? []).map((requirement: any) => requirement.status);
    const summary = calculateComplianceSummary(statuses);
    const mapped = {
      id: framework.id,
      organizationId: framework.organizationId,
      frameworkCatalogId: framework.frameworkCatalogId,
      framework: {
        id: framework.frameworkCatalog.id,
        code: framework.frameworkCatalog.code,
        name: framework.frameworkCatalog.name,
        version: framework.frameworkCatalog.version,
      },
      code: framework.frameworkCatalog.code,
      name: framework.frameworkCatalog.name,
      version: framework.frameworkCatalog.version,
      status: framework.status,
      owner: this.member(framework.ownerMembership),
      adoptedAt: framework.adoptedAt,
      targetDate: framework.targetDate,
      archivedAt: framework.archivedAt,
      summary: {
        ...summary,
        controlCoveragePercent: summary.totalRequirements === 0
          ? 0
          : Math.round(((framework.requirements ?? []).filter((item: any) => item.controlLinks?.length > 0).length / summary.totalRequirements) * 1000) / 10,
      },
      createdAt: framework.createdAt,
      updatedAt: framework.updatedAt,
    };
    return mapped;
  }

  async listFrameworks(access: OrganizationAccess, dto: ListComplianceFrameworksDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.OrganizationFrameworkWhereInput = {
      organizationId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(dto.search ? {
        OR: [
          { frameworkCatalog: { is: { code: { contains: dto.search, mode: 'insensitive' } } } },
          { frameworkCatalog: { is: { name: { contains: dto.search, mode: 'insensitive' } } } },
          { frameworkCatalog: { is: { version: { contains: dto.search, mode: 'insensitive' } } } },
        ],
      } : {}),
    };
    const sortBy = dto.sortBy ?? 'updatedAt';
    const orderBy: Prisma.OrganizationFrameworkOrderByWithRelationInput = sortBy === 'code' || sortBy === 'name' || sortBy === 'version'
      ? { frameworkCatalog: { [sortBy]: dto.sortOrder ?? 'desc' } }
      : { [sortBy]: dto.sortOrder ?? 'desc' };
    const [frameworks, total] = await Promise.all([
      this.prisma.organizationFramework.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          frameworkCatalog: true,
          ownerMembership: { include: { user: { select: { email: true } } } },
          requirements: { select: { status: true, controlLinks: { select: { id: true } } } },
        },
      }),
      this.prisma.organizationFramework.count({ where }),
    ]);
    return {
      data: frameworks.map((framework) => this.mapFramework(framework)),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async summary(access: OrganizationAccess) {
    const frameworks = await this.prisma.organizationFramework.findMany({
      where: { organizationId: this.organizationId(access), status: OrganizationFrameworkStatus.ACTIVE },
      select: { requirements: { select: { status: true, controlLinks: { select: { id: true } } } } },
    });
    const requirements = frameworks.flatMap((framework) => framework.requirements);
    const summary = calculateComplianceSummary(requirements.map((requirement) => requirement.status));
    return {
      ...summary,
      controlCoveragePercent: summary.totalRequirements === 0 ? 0 : Math.round((requirements.filter((requirement) => requirement.controlLinks.length > 0).length / summary.totalRequirements) * 1000) / 10,
    };
  }

  async getFramework(access: OrganizationAccess, organizationFrameworkId: string) {
    return this.mapFramework(await this.getFrameworkRecord(access, organizationFrameworkId));
  }

  async adoptFramework(access: OrganizationAccess, dto: AdoptFrameworkDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    const catalog = await this.prisma.frameworkCatalog.findUnique({
      where: { id: dto.frameworkCatalogId },
      include: { requirements: { select: { id: true } } },
    });
    if (!catalog || catalog.status !== 'ACTIVE') throw new NotFoundException('Active framework catalog entry not found');

    const existing = await this.prisma.organizationFramework.findFirst({
      where: { organizationId, frameworkCatalogId: dto.frameworkCatalogId },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Framework is already adopted by this organization');

    let created;
    try {
      created = await this.prisma.$transaction(async (tx) => {
        const framework = await tx.organizationFramework.create({
          data: {
            organizationId,
            frameworkCatalogId: dto.frameworkCatalogId,
            ownerMembershipId: dto.ownerMembershipId ?? null,
            adoptedByMembershipId: access.membership.id,
            targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
          },
        });
        if (catalog.requirements.length > 0) {
          await tx.organizationRequirement.createMany({
            data: catalog.requirements.map((requirement) => ({
              organizationId,
              organizationFrameworkId: framework.id,
              frameworkRequirementId: requirement.id,
              status: OrganizationRequirementStatus.NOT_ASSESSED,
            })),
          });
        }
        return framework;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Framework is already adopted by this organization');
      }
      throw error;
    }
    return this.getFramework(access, created.id);
  }

  async archiveFramework(access: OrganizationAccess, organizationFrameworkId: string) {
    this.assertManage(access);
    const framework = await this.getFrameworkRecord(access, organizationFrameworkId);
    if (framework.status !== OrganizationFrameworkStatus.ACTIVE) {
      throw new ConflictException(`Framework cannot transition from ${framework.status} to ARCHIVED`);
    }
    await this.prisma.organizationFramework.update({
      where: { organizationId_id: { organizationId: this.organizationId(access), id: organizationFrameworkId } },
      data: { status: OrganizationFrameworkStatus.ARCHIVED, archivedAt: new Date() },
    });
    return this.getFramework(access, organizationFrameworkId);
  }

  private async getRequirementRecord(access: OrganizationAccess, requirementId: string) {
    const requirement = await this.prisma.organizationRequirement.findFirst({
      where: { id: requirementId, organizationId: this.organizationId(access) },
      include: {
        organizationFramework: { include: { frameworkCatalog: true } },
        frameworkRequirement: true,
        ownerMembership: { include: { user: { select: { email: true } } } },
        assessments: {
          orderBy: { assessedAt: 'desc' },
          include: { assessedByMembership: { include: { user: { select: { email: true } } } } },
        },
        controlLinks: { include: { control: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!requirement) throw new NotFoundException('Organization requirement not found');
    return requirement;
  }

  private mapRequirement(requirement: any) {
    const latestAssessment = requirement.assessments?.[0] ?? null;
    return {
      id: requirement.id,
      organizationId: requirement.organizationId,
      organizationFrameworkId: requirement.organizationFrameworkId,
      framework: {
        id: requirement.organizationFramework.frameworkCatalog.id,
        code: requirement.organizationFramework.frameworkCatalog.code,
        name: requirement.organizationFramework.frameworkCatalog.name,
        version: requirement.organizationFramework.frameworkCatalog.version,
        status: requirement.organizationFramework.status,
      },
      catalogRequirement: {
        id: requirement.frameworkRequirement.id,
        code: requirement.frameworkRequirement.code,
        title: requirement.frameworkRequirement.title,
        description: requirement.frameworkRequirement.description,
        domain: requirement.frameworkRequirement.domain,
        parentRequirementId: requirement.frameworkRequirement.parentRequirementId,
        sortOrder: requirement.frameworkRequirement.sortOrder,
      },
      code: requirement.frameworkRequirement.code,
      title: requirement.frameworkRequirement.title,
      description: requirement.frameworkRequirement.description,
      domain: requirement.frameworkRequirement.domain,
      parentRequirementId: requirement.frameworkRequirement.parentRequirementId,
      status: requirement.status,
      owner: this.member(requirement.ownerMembership),
      notes: requirement.notes,
      targetDate: requirement.targetDate,
      applicabilityReason: requirement.applicabilityReason,
      lastAssessedAt: requirement.lastAssessedAt,
      nextReviewAt: requirement.nextReviewAt,
      latestAssessment: latestAssessment ? this.mapAssessment(latestAssessment) : null,
      assessments: (requirement.assessments ?? []).map((assessment: any) => this.mapAssessment(assessment)),
      linkedControls: (requirement.controlLinks ?? []).map((link: any) => link.control),
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
    };
  }

  private mapAssessment(assessment: any) {
    return {
      id: assessment.id,
      organizationRequirementId: assessment.organizationRequirementId,
      status: assessment.status,
      rationale: assessment.rationale,
      assessedBy: this.member(assessment.assessedByMembership),
      assessedByMembershipId: assessment.assessedByMembershipId,
      assessedAt: assessment.assessedAt,
      createdAt: assessment.createdAt,
    };
  }

  async listRequirements(access: OrganizationAccess, organizationFrameworkId: string, dto: ListRequirementsDto) {
    const organizationId = this.organizationId(access);
    await this.getFrameworkRecord(access, organizationFrameworkId);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.OrganizationRequirementWhereInput = {
      organizationId,
      organizationFrameworkId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(dto.domain ? { frameworkRequirement: { domain: dto.domain } } : {}),
      ...(dto.search ? {
        OR: [
          { frameworkRequirement: { code: { contains: dto.search, mode: 'insensitive' } } },
          { frameworkRequirement: { title: { contains: dto.search, mode: 'insensitive' } } },
          { frameworkRequirement: { description: { contains: dto.search, mode: 'insensitive' } } },
        ],
      } : {}),
      ...(dto.hasControls === 'true' ? { controlLinks: { some: { organizationId } } } : {}),
      ...(dto.hasControls === 'false' ? { controlLinks: { none: { organizationId } } } : {}),
    };
    const sortBy = dto.sortBy ?? 'updatedAt';
    const orderBy: Prisma.OrganizationRequirementOrderByWithRelationInput = sortBy === 'code' || sortBy === 'title' || sortBy === 'domain'
      ? { frameworkRequirement: { [sortBy]: dto.sortOrder ?? 'asc' } }
      : { [sortBy]: dto.sortOrder ?? 'asc' };
    const [requirements, total] = await Promise.all([
      this.prisma.organizationRequirement.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          frameworkRequirement: true,
          ownerMembership: { include: { user: { select: { email: true } } } },
          controlLinks: { include: { control: true }, orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.organizationRequirement.count({ where }),
    ]);
    return {
      data: requirements.map((requirement) => ({
        id: requirement.id,
        organizationFrameworkId: requirement.organizationFrameworkId,
        code: requirement.frameworkRequirement.code,
        title: requirement.frameworkRequirement.title,
        description: requirement.frameworkRequirement.description,
        domain: requirement.frameworkRequirement.domain,
        parentRequirementId: requirement.frameworkRequirement.parentRequirementId,
        status: requirement.status,
        owner: this.member(requirement.ownerMembership),
        targetDate: requirement.targetDate,
        nextReviewAt: requirement.nextReviewAt,
        linkedControls: requirement.controlLinks.map((link) => link.control),
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getRequirement(access: OrganizationAccess, requirementId: string) {
    return this.mapRequirement(await this.getRequirementRecord(access, requirementId));
  }

  async updateRequirement(access: OrganizationAccess, requirementId: string, dto: UpdateOrganizationRequirementDto) {
    this.assertManage(access);
    const requirement = await this.getRequirementRecord(access, requirementId);
    this.assertActiveFramework(requirement.organizationFramework);
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    const data: Prisma.OrganizationRequirementUncheckedUpdateInput = {};
    if (dto.ownerMembershipId !== undefined) data.ownerMembershipId = dto.ownerMembershipId;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() || null;
    if (dto.targetDate !== undefined) data.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
    if (dto.nextReviewAt !== undefined) data.nextReviewAt = dto.nextReviewAt ? new Date(dto.nextReviewAt) : null;
    if (dto.applicabilityReason !== undefined) data.applicabilityReason = dto.applicabilityReason?.trim() || null;
    await this.prisma.organizationRequirement.update({ where: { organizationId_id: { organizationId, id: requirementId } }, data });
    return this.getRequirement(access, requirementId);
  }

  async createAssessment(access: OrganizationAccess, requirementId: string, dto: CreateRequirementAssessmentDto) {
    this.assertManage(access);
    const requirement = await this.getRequirementRecord(access, requirementId);
    this.assertActiveFramework(requirement.organizationFramework);
    validateAssessmentRationale(dto.status, dto.rationale);
    const rationale = dto.rationale?.trim() || '';
    const organizationId = this.organizationId(access);
    await this.prisma.$transaction(async (tx) => {
      await tx.requirementAssessment.create({
        data: {
          organizationId,
          organizationRequirementId: requirementId,
          status: dto.status,
          rationale,
          assessedByMembershipId: access.membership.id,
        },
      });
      await tx.organizationRequirement.update({
        where: { organizationId_id: { organizationId, id: requirementId } },
        data: {
          status: dto.status,
          lastAssessedAt: new Date(),
          applicabilityReason: dto.status === OrganizationRequirementStatus.NOT_APPLICABLE ? rationale : null,
        },
      });
    });
    return this.getRequirement(access, requirementId);
  }

  async listAssessments(access: OrganizationAccess, requirementId: string) {
    const requirement = await this.getRequirementRecord(access, requirementId);
    return { data: requirement.assessments.map((assessment) => this.mapAssessment(assessment)) };
  }

  private async assertControlLinkMutation(access: OrganizationAccess, requirementId: string) {
    this.assertManage(access);
    const requirement = await this.getRequirementRecord(access, requirementId);
    this.assertActiveFramework(requirement.organizationFramework);
    return requirement;
  }

  async listRequirementControls(access: OrganizationAccess, requirementId: string) {
    const requirement = await this.getRequirementRecord(access, requirementId);
    return { data: requirement.controlLinks.map((link: any) => link.control) };
  }

  async linkControl(access: OrganizationAccess, requirementId: string, controlId: string) {
    await this.assertControlLinkMutation(access, requirementId);
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { id: controlId, organizationId }, select: { id: true, status: true } });
    if (!control) throw new NotFoundException('Control not found');
    if (control.status === ControlStatus.ARCHIVED) throw new ConflictException('Archived controls cannot be linked');
    try {
      await this.prisma.requirementControl.create({ data: { organizationId, organizationRequirementId: requirementId, controlId, createdByMembershipId: access.membership.id } });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Control is already linked to this requirement');
      throw error;
    }
    return this.listRequirementControls(access, requirementId);
  }

  async unlinkControl(access: OrganizationAccess, requirementId: string, controlId: string) {
    await this.assertControlLinkMutation(access, requirementId);
    const organizationId = this.organizationId(access);
    const link = await this.prisma.requirementControl.findFirst({ where: { organizationId, organizationRequirementId: requirementId, controlId }, select: { id: true } });
    if (!link) throw new NotFoundException('Control link not found');
    await this.prisma.requirementControl.delete({ where: { organizationId_id: { organizationId, id: link.id } } });
    return { deleted: true };
  }

  async listControlRequirements(access: OrganizationAccess, controlId: string) {
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { id: controlId, organizationId }, select: { id: true } });
    if (!control) throw new NotFoundException('Control not found');
    const links = await this.prisma.requirementControl.findMany({
      where: { organizationId, controlId },
      include: {
        organizationRequirement: {
          include: {
            frameworkRequirement: true,
            organizationFramework: { include: { frameworkCatalog: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data: links.map((link) => ({
        id: link.organizationRequirement.id,
        code: link.organizationRequirement.frameworkRequirement.code,
        title: link.organizationRequirement.frameworkRequirement.title,
        status: link.organizationRequirement.status,
        framework: {
          code: link.organizationRequirement.organizationFramework.frameworkCatalog.code,
          name: link.organizationRequirement.organizationFramework.frameworkCatalog.name,
          version: link.organizationRequirement.organizationFramework.frameworkCatalog.version,
        },
      })),
    };
  }
}
