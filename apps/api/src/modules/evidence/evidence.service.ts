import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EvidenceStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { Buffer } from 'node:buffer';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateEvidenceDto, CreateEvidenceVersionDto, ListEvidenceDto, UpdateEvidenceDto } from './dto';
import { EVIDENCE_STORAGE_SERVICE } from './evidence-storage.service';
import type { EvidenceStorageService } from './evidence-storage.service';
import { nextEvidenceVersion, validateVersionPayload } from './evidence.utils';
import { evidenceAttentionReason, evidenceSummaryWindow } from './evidence-summary.utils';

export interface UploadedEvidenceFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const EVIDENCE_WRITE_ROLES: string[] = [
  ORGANIZATION_ROLE_CODES.OWNER,
  ORGANIZATION_ROLE_CODES.GRC_ADMIN,
  ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
];

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService, @Inject(EVIDENCE_STORAGE_SERVICE) private readonly storage: EvidenceStorageService) {}

  private organizationId(access: OrganizationAccess) { return access.organization.id; }

  private assertWriteAccess(access: OrganizationAccess) {
    if (!access.roleCodes.some((role) => EVIDENCE_WRITE_ROLES.includes(role))) throw new ForbiddenException('Not allowed to manage evidence');
  }

  private async assertMembership(organizationId: string, membershipId: string | null | undefined, field: string) {
    if (!membershipId) return;
    const membership = await this.prisma.membership.findFirst({ where: { organizationId, id: membershipId, status: 'ACTIVE' }, select: { id: true } });
    if (!membership) throw new BadRequestException(`${field} must be an active organization membership`);
  }

  private async getRecord(access: OrganizationAccess, evidenceId: string) {
    const evidence = await this.prisma.evidence.findFirst({
      where: { organizationId: this.organizationId(access), id: evidenceId },
      include: {
        ownerMembership: { include: { user: { select: { id: true, email: true } } } },
        createdByMembership: { include: { user: { select: { id: true, email: true } } } },
        versions: { orderBy: { versionNumber: 'desc' } },
        controlLinks: { include: { control: true }, orderBy: { linkedAt: 'desc' } },
        executionLinks: { include: { controlExecution: true }, orderBy: { linkedAt: 'desc' } },
      },
    });
    if (!evidence) throw new NotFoundException('Evidence not found');
    return evidence;
  }

  private effectiveStatus(evidence: { status: EvidenceStatus; expiresAt: Date | null }) {
    if (evidence.status !== EvidenceStatus.ARCHIVED && evidence.expiresAt && evidence.expiresAt <= new Date()) return EvidenceStatus.EXPIRED;
    return evidence.status;
  }

  private member(member: { id: string; user?: { id: string; email: string } } | null | undefined) {
    return member ? { id: member.id, name: member.user?.email ?? member.id } : null;
  }

  private mapVersion(version: any) {
    return {
      id: version.id,
      evidenceId: version.evidenceId,
      versionNumber: version.versionNumber,
      fileName: version.fileName,
      storageKey: version.storageKey,
      mimeType: version.mimeType,
      fileSize: version.fileSize,
      checksum: version.checksum,
      externalUrl: version.externalUrl,
      textContent: version.textContent,
      uploadedByMembershipId: version.uploadedByMembershipId,
      createdAt: version.createdAt,
    };
  }

  private mapEvidence(evidence: any) {
    return {
      id: evidence.id,
      organizationId: evidence.organizationId,
      title: evidence.title,
      description: evidence.description,
      type: evidence.type,
      status: this.effectiveStatus(evidence),
      owner: this.member(evidence.ownerMembership),
      ownerMembershipId: evidence.ownerMembershipId,
      createdBy: this.member(evidence.createdByMembership),
      createdByMembershipId: evidence.createdByMembershipId,
      effectiveFrom: evidence.effectiveFrom,
      effectiveTo: evidence.effectiveTo,
      expiresAt: evidence.expiresAt,
      archivedAt: evidence.archivedAt,
      createdAt: evidence.createdAt,
      updatedAt: evidence.updatedAt,
      versions: evidence.versions?.map((version: any) => this.mapVersion(version)) ?? [],
      linkedControls: evidence.controlLinks?.map((link: any) => link.control) ?? [],
      linkedExecutions: evidence.executionLinks?.map((link: any) => link.controlExecution) ?? [],
    };
  }

  async create(access: OrganizationAccess, dto: CreateEvidenceDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    if (dto.effectiveFrom && dto.effectiveTo && new Date(dto.effectiveFrom) > new Date(dto.effectiveTo)) throw new BadRequestException('effectiveFrom must be before or equal to effectiveTo');
    const evidence = await this.prisma.evidence.create({
      data: {
        organizationId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        type: dto.type,
        ownerMembershipId: dto.ownerMembershipId ?? null,
        createdByMembershipId: access.membership.id,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
    return this.mapEvidence(evidence);
  }

  async list(access: OrganizationAccess, dto: ListEvidenceDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? dto.limit ?? 20;
    const where: Prisma.EvidenceWhereInput = {
      organizationId,
      ...(dto.type ? { type: dto.type } : {}),
      ...(dto.ownerMembershipId ? { ownerMembershipId: dto.ownerMembershipId } : {}),
      ...(dto.createdByMembershipId ? { createdByMembershipId: dto.createdByMembershipId } : {}),
      ...(dto.controlId ? { controlLinks: { some: { organizationId, controlId: dto.controlId } } } : {}),
      ...(dto.expiresBefore ? { expiresAt: { lte: new Date(dto.expiresBefore) } } : {}),
      ...(dto.search ? { OR: [{ title: { contains: dto.search, mode: 'insensitive' } }, { description: { contains: dto.search, mode: 'insensitive' } }] } : {}),
      ...(dto.status && dto.status !== EvidenceStatus.EXPIRED ? { status: dto.status } : {}),
      ...(dto.status === EvidenceStatus.EXPIRED ? { OR: [{ status: EvidenceStatus.EXPIRED }, { status: { not: EvidenceStatus.ARCHIVED }, expiresAt: { lte: new Date() } }] } : {}),
    };
    const [records, total] = await Promise.all([
      this.prisma.evidence.findMany({
        where,
        orderBy: { [dto.sortBy ?? 'updatedAt']: dto.sortOrder ?? 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          ownerMembership: { include: { user: { select: { id: true, email: true } } } },
          createdByMembership: { include: { user: { select: { id: true, email: true } } } },
          versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          _count: { select: { controlLinks: true, executionLinks: true, versions: true } },
        },
      }),
      this.prisma.evidence.count({ where }),
    ]);
    return { data: records.map((record) => this.mapEvidence(record)), pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async summary(access: OrganizationAccess) {
    const organizationId = this.organizationId(access);
    const now = new Date();
    const { to } = evidenceSummaryWindow(now);
    const nonArchived = { organizationId, status: { not: EvidenceStatus.ARCHIVED } } as const;
    const expiredWhere = { ...nonArchived, OR: [{ status: EvidenceStatus.EXPIRED }, { expiresAt: { lt: now } }] };
    const currentWhere = { ...nonArchived, status: { notIn: [EvidenceStatus.ARCHIVED, EvidenceStatus.EXPIRED] }, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] };
    const [total, current, expiringSoon, expired, missingVersion, withoutControl, withoutExecution, linkedToControl, linkedToExecution, hasVersion, recentlyUpdated, attention] = await Promise.all([
      this.prisma.evidence.count({ where: nonArchived }),
      this.prisma.evidence.count({ where: currentWhere }),
      this.prisma.evidence.count({ where: { ...nonArchived, expiresAt: { gte: now, lte: to } } }),
      this.prisma.evidence.count({ where: expiredWhere }),
      this.prisma.evidence.count({ where: { ...nonArchived, versions: { none: {} } } }),
      this.prisma.evidence.count({ where: { ...nonArchived, controlLinks: { none: {} } } }),
      this.prisma.evidence.count({ where: { ...nonArchived, executionLinks: { none: {} } } }),
      this.prisma.evidence.count({ where: { ...nonArchived, controlLinks: { some: {} } } }),
      this.prisma.evidence.count({ where: { ...nonArchived, executionLinks: { some: {} } } }),
      this.prisma.evidence.count({ where: { ...nonArchived, versions: { some: {} } } }),
      this.prisma.evidence.findMany({ where: nonArchived, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, type: true, updatedAt: true, ownerMembership: { include: { user: { select: { email: true } } } }, versions: { orderBy: { versionNumber: 'desc' }, take: 1, select: { versionNumber: true, fileName: true, externalUrl: true, createdAt: true } } } }),
      this.prisma.evidence.findMany({
        where: { ...nonArchived, OR: [{ status: EvidenceStatus.EXPIRED }, { expiresAt: { lte: to } }, { versions: { none: {} } }, { controlLinks: { none: {} } }, { executionLinks: { none: {} } }] },
        orderBy: { updatedAt: 'desc' }, take: 3,
        select: { id: true, title: true, expiresAt: true, versions: { take: 1, orderBy: { versionNumber: 'desc' }, select: { id: true } }, _count: { select: { controlLinks: true, executionLinks: true } } },
      }),
    ]);
    const percentage = (count: number) => total ? Math.round((count / total) * 100) : 0;
    return {
      total, current, expiringSoon, expired, missingVersion, withoutControl, withoutExecution,
      traceability: { linkedToControlCount: linkedToControl, linkedToControlPercent: percentage(linkedToControl), linkedToExecutionCount: linkedToExecution, linkedToExecutionPercent: percentage(linkedToExecution), hasVersionCount: hasVersion, hasVersionPercent: percentage(hasVersion) },
      recentlyUpdated: recentlyUpdated.map((item) => ({ id: item.id, title: item.title, type: item.type, updatedAt: item.updatedAt, owner: item.ownerMembership?.user?.email ?? null, currentVersion: item.versions[0] ?? null })),
      attention: attention.map((item) => ({ id: item.id, title: item.title, expiresAt: item.expiresAt, reason: evidenceAttentionReason({ expiresAt: item.expiresAt, hasVersion: Boolean(item.versions[0]), hasControl: item._count.controlLinks > 0, hasExecution: item._count.executionLinks > 0 }, now) ?? 'Evidence attention' })),
    };
  }

  async findOne(access: OrganizationAccess, evidenceId: string) { return this.mapEvidence(await this.getRecord(access, evidenceId)); }

  async update(access: OrganizationAccess, evidenceId: string, dto: UpdateEvidenceDto) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const evidence = await this.getRecord(access, evidenceId);
    if (evidence.status === EvidenceStatus.ARCHIVED) throw new ConflictException('Archived evidence cannot be updated');
    if (dto.type !== undefined && dto.type !== evidence.type && evidence.versions.length > 0) throw new ConflictException('Evidence type cannot change after a version exists');
    await this.assertMembership(organizationId, dto.ownerMembershipId, 'ownerMembershipId');
    if (dto.effectiveFrom && dto.effectiveTo && new Date(dto.effectiveFrom) > new Date(dto.effectiveTo)) throw new BadRequestException('effectiveFrom must be before or equal to effectiveTo');
    const data: Prisma.EvidenceUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.ownerMembershipId !== undefined) data.ownerMembershipId = dto.ownerMembershipId;
    if (dto.effectiveFrom !== undefined) data.effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : null;
    if (dto.effectiveTo !== undefined) data.effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    await this.prisma.evidence.update({ where: { organizationId_id: { organizationId, id: evidenceId } }, data });
    return this.findOne(access, evidenceId);
  }

  async addVersion(access: OrganizationAccess, evidenceId: string, dto: CreateEvidenceVersionDto, file?: UploadedEvidenceFile) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const evidence = await this.getRecord(access, evidenceId);
    if (evidence.status === EvidenceStatus.ARCHIVED) throw new ConflictException('Archived evidence cannot receive new versions');
    validateVersionPayload(evidence.type, { ...(file ? { file } : {}), ...(dto.externalUrl ? { externalUrl: dto.externalUrl } : {}), ...(dto.textContent ? { textContent: dto.textContent } : {}) });
    const version = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Evidence" WHERE id = ${evidenceId}::uuid AND "organizationId" = ${organizationId}::uuid FOR UPDATE`;
      const existing = await tx.evidenceVersion.findMany({ where: { organizationId, evidenceId }, select: { versionNumber: true } });
      const versionNumber = nextEvidenceVersion(existing.map((item) => item.versionNumber));
      let fileMetadata: { storageKey: string; fileSize: number; checksum: string } | undefined;
      if (file) fileMetadata = await this.storage.save(organizationId, evidenceId, versionNumber, dto.fileName ?? file.originalname, file.buffer);
      return tx.evidenceVersion.create({
        data: {
          organizationId,
          evidenceId,
          versionNumber,
          fileName: file ? (dto.fileName ?? file.originalname) : null,
          storageKey: fileMetadata?.storageKey ?? null,
          mimeType: file ? (dto.mimeType ?? file.mimetype) : null,
          fileSize: fileMetadata?.fileSize ?? null,
          checksum: fileMetadata?.checksum ?? null,
          externalUrl: dto.externalUrl?.trim() || null,
          textContent: dto.textContent ?? null,
          uploadedByMembershipId: access.membership.id,
        },
      });
    });
    return this.mapVersion(version);
  }

  async listVersions(access: OrganizationAccess, evidenceId: string) {
    await this.getRecord(access, evidenceId);
    const versions = await this.prisma.evidenceVersion.findMany({ where: { organizationId: this.organizationId(access), evidenceId }, orderBy: { versionNumber: 'desc' } });
    return { data: versions.map((version) => this.mapVersion(version)) };
  }

  async archive(access: OrganizationAccess, evidenceId: string) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    const evidence = await this.getRecord(access, evidenceId);
    if (evidence.status === EvidenceStatus.ARCHIVED) throw new ConflictException('Evidence is already archived');
    await this.prisma.evidence.update({ where: { organizationId_id: { organizationId, id: evidenceId } }, data: { status: EvidenceStatus.ARCHIVED, archivedAt: new Date() } });
    return this.findOne(access, evidenceId);
  }

  private async assertLinkableEvidence(access: OrganizationAccess, evidenceId: string) {
    const evidence = await this.getRecord(access, evidenceId);
    if (evidence.status === EvidenceStatus.ARCHIVED) throw new ConflictException('Archived evidence cannot be linked');
    return evidence;
  }

  async linkControl(access: OrganizationAccess, evidenceId: string, controlId: string) {
    this.assertWriteAccess(access);
    await this.assertLinkableEvidence(access, evidenceId);
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { organizationId, id: controlId }, select: { id: true, status: true } });
    if (!control) throw new NotFoundException('Control not found');
    if (control.status === 'ARCHIVED') throw new ConflictException('Archived controls cannot be linked');
    try { return await this.prisma.controlEvidence.create({ data: { organizationId, evidenceId, controlId, linkedByMembershipId: access.membership.id } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Evidence is already linked to this control'); throw error; }
  }

  async unlinkControl(access: OrganizationAccess, evidenceId: string, controlId: string) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.assertLinkableEvidence(access, evidenceId);
    const link = await this.prisma.controlEvidence.findFirst({ where: { organizationId, evidenceId, controlId }, select: { id: true } });
    if (!link) throw new NotFoundException('Evidence control link not found');
    await this.prisma.controlEvidence.delete({ where: { organizationId_id: { organizationId, id: link.id } } });
    return { deleted: true };
  }

  async listControlsForEvidence(access: OrganizationAccess, evidenceId: string) {
    await this.getRecord(access, evidenceId);
    const links = await this.prisma.controlEvidence.findMany({ where: { organizationId: this.organizationId(access), evidenceId }, include: { control: true }, orderBy: { linkedAt: 'desc' } });
    return { data: links.map((link) => link.control) };
  }

  async listEvidenceForControl(access: OrganizationAccess, controlId: string) {
    const organizationId = this.organizationId(access);
    const control = await this.prisma.control.findFirst({ where: { organizationId, id: controlId }, select: { id: true } });
    if (!control) throw new NotFoundException('Control not found');
    const links = await this.prisma.controlEvidence.findMany({ where: { organizationId, controlId }, include: { evidence: true }, orderBy: { linkedAt: 'desc' } });
    return { data: links.map((link) => this.mapEvidence(link.evidence)) };
  }

  async linkExecution(access: OrganizationAccess, evidenceId: string, executionId: string) {
    this.assertWriteAccess(access);
    await this.assertLinkableEvidence(access, evidenceId);
    const organizationId = this.organizationId(access);
    const execution = await this.prisma.controlExecution.findFirst({ where: { organizationId, id: executionId }, select: { id: true } });
    if (!execution) throw new NotFoundException('Control execution not found');
    try { return await this.prisma.executionEvidence.create({ data: { organizationId, evidenceId, controlExecutionId: executionId, linkedByMembershipId: access.membership.id } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Evidence is already linked to this execution'); throw error; }
  }

  async unlinkExecution(access: OrganizationAccess, evidenceId: string, executionId: string) {
    this.assertWriteAccess(access);
    const organizationId = this.organizationId(access);
    await this.assertLinkableEvidence(access, evidenceId);
    const link = await this.prisma.executionEvidence.findFirst({ where: { organizationId, evidenceId, controlExecutionId: executionId }, select: { id: true } });
    if (!link) throw new NotFoundException('Evidence execution link not found');
    await this.prisma.executionEvidence.delete({ where: { organizationId_id: { organizationId, id: link.id } } });
    return { deleted: true };
  }

  async listExecutionsForEvidence(access: OrganizationAccess, evidenceId: string) {
    await this.getRecord(access, evidenceId);
    const links = await this.prisma.executionEvidence.findMany({ where: { organizationId: this.organizationId(access), evidenceId }, include: { controlExecution: true }, orderBy: { linkedAt: 'desc' } });
    return { data: links.map((link) => link.controlExecution) };
  }

  async listEvidenceForExecution(access: OrganizationAccess, executionId: string) {
    const organizationId = this.organizationId(access);
    const execution = await this.prisma.controlExecution.findFirst({ where: { organizationId, id: executionId }, select: { id: true } });
    if (!execution) throw new NotFoundException('Control execution not found');
    const links = await this.prisma.executionEvidence.findMany({ where: { organizationId, controlExecutionId: executionId }, include: { evidence: true }, orderBy: { linkedAt: 'desc' } });
    return { data: links.map((link) => this.mapEvidence(link.evidence)) };
  }
}
