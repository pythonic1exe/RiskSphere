import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RiskStatus, RiskTreatmentStrategy, RiskTreatmentStatus } from '@prisma/client';
import type { Prisma, RiskSeverity } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
import { OrganizationAuthorizationService } from '../../common/authorization';
import { PrismaService } from '../../database/prisma.service';
import type { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import type { CreateRiskDto } from './dto/create-risk.dto';
import type { ListRisksDto } from './dto/list-risks.dto';
import type { ReviewRiskDto } from './dto/review-risk.dto';
import type { UpdateRiskTreatmentDto } from './dto/update-risk-treatment.dto';
import type { UpdateRiskDto } from './dto/update-risk.dto';
import { riskAttentionReason, riskSummaryWindow } from './risks-summary.utils';

const RISK_WRITE_ROLES = [
  ORGANIZATION_ROLE_CODES.OWNER,
  ORGANIZATION_ROLE_CODES.GRC_ADMIN,
  ORGANIZATION_ROLE_CODES.RISK_MANAGER,
];

export function calculateRiskAssessment(likelihood: number, impact: number) {
  const score = likelihood * impact;
  const severity: RiskSeverity = score <= 4 ? 'LOW' : score <= 9 ? 'MEDIUM' : score <= 16 ? 'HIGH' : 'CRITICAL';
  return { score, severity };
}

@Injectable()
export class RisksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: OrganizationAuthorizationService,
  ) {}

  private assertWriteAccess(access: OrganizationAccess) {
    if (!access.roleCodes.some((role) => RISK_WRITE_ROLES.includes(role as (typeof RISK_WRITE_ROLES)[number]))) {
      throw new ForbiddenException('Not allowed to manage risks');
    }
  }

  private async assertMembership(organizationId: string, membershipId: string | undefined, field: string) {
    if (!membershipId) return;
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, organizationId, status: 'ACTIVE' },
    });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private async getRisk(access: OrganizationAccess, riskId: string) {
    const risk = await this.prisma.risk.findFirst({
      where: { id: riskId, organizationId: access.organization.id },
      include: { ownerMembership: true, assessments: { orderBy: { assessedAt: 'desc' } }, treatment: true },
    });
    if (!risk) throw new NotFoundException('Risk not found');
    return risk;
  }

  async list(access: OrganizationAccess, dto: ListRisksDto) {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const where: Prisma.RiskWhereInput = {
      organizationId: access.organization.id,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.category ? { category: dto.category } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(dto.search ? { OR: [{ title: { contains: dto.search, mode: 'insensitive' } }, { code: { contains: dto.search, mode: 'insensitive' } }, { description: { contains: dto.search, mode: 'insensitive' } }] } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.risk.findMany({ where, include: { ownerMembership: true, treatment: true }, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.risk.count({ where }),
    ]);
    return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async summary(access: OrganizationAccess) {
    const organizationId = access.organization.id;
    const now = new Date();
    const { to } = riskSummaryWindow(now);
    const [total, active, withoutAssessment, withoutTreatment, dueForReview, assessments, attention] = await Promise.all([
      this.prisma.risk.count({ where: { organizationId } }),
      this.prisma.risk.count({ where: { organizationId, status: RiskStatus.ACTIVE } }),
      this.prisma.risk.count({ where: { organizationId, assessments: { none: {} } } }),
      this.prisma.risk.count({ where: { organizationId, treatment: { is: null } } }),
      this.prisma.risk.count({ where: { organizationId, nextReviewAt: { lte: to }, status: { not: RiskStatus.ARCHIVED } } }),
      this.prisma.riskAssessment.findMany({ where: { organizationId }, orderBy: { assessedAt: 'desc' }, select: { riskId: true, severity: true } }),
      this.prisma.risk.findMany({
        where: { organizationId, status: { not: RiskStatus.ARCHIVED }, OR: [{ nextReviewAt: { lte: to } }, { assessments: { none: {} } }, { treatment: { is: null } }] },
        orderBy: { updatedAt: 'desc' }, take: 8,
        select: { id: true, code: true, title: true, nextReviewAt: true, treatment: { select: { id: true } }, assessments: { orderBy: { assessedAt: 'desc' }, take: 1, select: { severity: true } } },
      }),
    ]);
    const latestByRisk = new Map<string, string>();
    for (const assessment of assessments) if (!latestByRisk.has(assessment.riskId)) latestByRisk.set(assessment.riskId, assessment.severity);
    const severityDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, UNRATED: 0 };
    for (const severity of latestByRisk.values()) severityDistribution[severity as keyof typeof severityDistribution] += 1;
    severityDistribution.UNRATED = total - latestByRisk.size;
    const criticalHigh = (['HIGH', 'CRITICAL'] as const).reduce((count, severity) => count + severityDistribution[severity], 0);
    return {
      total, active, criticalHigh, withoutAssessment, withoutTreatment, dueForReview,
      severityDistribution,
      attention: attention.map((risk) => ({ id: risk.id, code: risk.code, title: risk.title, severity: risk.assessments[0]?.severity ?? null, dueAt: risk.nextReviewAt, reason: riskAttentionReason({ severity: risk.assessments[0]?.severity ?? null, hasTreatment: Boolean(risk.treatment), nextReviewAt: risk.nextReviewAt }, now) ?? 'Review attention' })),
    };
  }

  async create(access: OrganizationAccess, dto: CreateRiskDto) {
    this.assertWriteAccess(access);
    await this.assertMembership(access.organization.id, dto.ownerMembershipId, 'ownerMembershipId');
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Organization" WHERE id = ${access.organization.id}::uuid FOR UPDATE`;
      const existingCodes = await tx.risk.findMany({ where: { organizationId: access.organization.id }, select: { code: true } });
      const nextNumber = existingCodes.reduce((max, risk) => Math.max(max, Number(risk.code.replace(/^R-/, '')) || 0), 0) + 1;
      const code = `R-${String(nextNumber).padStart(3, '0')}`;
      const setting = tx.organizationSetting ? await tx.organizationSetting.findUnique({ where: { organizationId: access.organization.id }, select: { riskReviewFrequencyDays: true } }) : null;
      const nextReviewAt = setting?.riskReviewFrequencyDays ? new Date(Date.now() + setting.riskReviewFrequencyDays * 86400000) : null;
      return tx.risk.create({ data: { organizationId: access.organization.id, code, title: dto.title.trim(), description: dto.description?.trim() || null, category: dto.category?.trim() || null, ownerMembershipId: dto.ownerMembershipId ?? null, nextReviewAt, createdByMembershipId: access.membership.id, updatedByMembershipId: access.membership.id } });
    });
  }

  async findOne(access: OrganizationAccess, riskId: string) { return this.getRisk(access, riskId); }

  async update(access: OrganizationAccess, riskId: string, dto: UpdateRiskDto) {
    this.assertWriteAccess(access);
    await this.getRisk(access, riskId);
    await this.assertMembership(access.organization.id, dto.ownerMembershipId, 'ownerMembershipId');
    const data: Prisma.RiskUncheckedUpdateInput = { updatedByMembershipId: access.membership.id };
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim() || null;
    if (dto.category !== undefined) data.category = dto.category.trim() || null;
    if (dto.ownerMembershipId !== undefined) data.ownerMembershipId = dto.ownerMembershipId;
    if (dto.status !== undefined) {
      if (dto.status === RiskStatus.DRAFT && (await this.getRisk(access, riskId)).status !== RiskStatus.DRAFT) {
        throw new ConflictException('Only draft risks can remain or return to draft');
      }
      data.status = dto.status;
    }
    return this.prisma.risk.update({ where: { organizationId_id: { organizationId: access.organization.id, id: riskId } }, data });
  }

  async addAssessment(access: OrganizationAccess, riskId: string, dto: CreateRiskAssessmentDto) {
    this.assertWriteAccess(access);
    const risk = await this.getRisk(access, riskId);
    if (risk.status === RiskStatus.ARCHIVED) throw new ConflictException('Archived risks cannot be assessed');
    const calculated = calculateRiskAssessment(dto.likelihood, dto.impact);
    return this.prisma.riskAssessment.create({ data: { organizationId: access.organization.id, riskId, type: dto.type, likelihood: dto.likelihood, impact: dto.impact, ...calculated, rationale: dto.rationale?.trim() || null, assessedByMembershipId: access.membership.id } });
  }

  async upsertTreatment(access: OrganizationAccess, riskId: string, dto: UpdateRiskTreatmentDto) {
    this.assertWriteAccess(access);
    const risk = await this.getRisk(access, riskId);
    if (risk.status === RiskStatus.ARCHIVED) throw new ConflictException('Archived risks cannot be treated');
    await this.assertMembership(access.organization.id, dto.ownerMembershipId, 'ownerMembershipId');
    const accepted = dto.strategy === RiskTreatmentStrategy.ACCEPT ? { acceptedByMembershipId: access.membership.id, acceptedAt: new Date() } : { acceptedByMembershipId: null, acceptedAt: null };
    const treatmentData = { strategy: dto.strategy, status: dto.status ?? RiskTreatmentStatus.NOT_STARTED, plan: dto.plan?.trim() || null, targetDate: dto.targetDate ? new Date(dto.targetDate) : null, ownerMembershipId: dto.ownerMembershipId ?? null, ...accepted };
    return this.prisma.riskTreatment.upsert({ where: { organizationId_riskId: { organizationId: access.organization.id, riskId } }, create: { organizationId: access.organization.id, riskId, ...treatmentData }, update: treatmentData });
  }

  async review(access: OrganizationAccess, riskId: string, dto: ReviewRiskDto) {
    this.assertWriteAccess(access);
    await this.getRisk(access, riskId);
    return this.prisma.risk.update({ where: { organizationId_id: { organizationId: access.organization.id, id: riskId } }, data: { lastReviewedAt: new Date(), nextReviewAt: new Date(dto.nextReviewAt), updatedByMembershipId: access.membership.id } });
  }

  async close(access: OrganizationAccess, riskId: string) { return this.changeStatus(access, riskId, RiskStatus.CLOSED, [RiskStatus.ACTIVE, RiskStatus.DRAFT]); }
  async archive(access: OrganizationAccess, riskId: string) { return this.changeStatus(access, riskId, RiskStatus.ARCHIVED, [RiskStatus.CLOSED]); }

  private async changeStatus(access: OrganizationAccess, riskId: string, status: RiskStatus, allowed: RiskStatus[]) {
    this.assertWriteAccess(access);
    const risk = await this.getRisk(access, riskId);
    if (!allowed.includes(risk.status)) throw new ConflictException(`Risk cannot transition from ${risk.status} to ${status}`);
    return this.prisma.risk.update({ where: { organizationId_id: { organizationId: access.organization.id, id: riskId } }, data: { status, ...(status === RiskStatus.ARCHIVED ? { archivedAt: new Date() } : {}), updatedByMembershipId: access.membership.id } });
  }
}
