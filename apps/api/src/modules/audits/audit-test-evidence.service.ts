import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditStatus, AuditTestStatus } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { LinkAuditTestEvidenceDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditTestsService } from './audit-tests.service';

@Injectable()
export class AuditTestEvidenceService {
  constructor(private readonly prisma: PrismaService, private readonly audits: AuditsService, private readonly tests: AuditTestsService) {}

  async list(access: OrganizationAccess, auditTestId: string) { const test = await this.tests.findOne(access, auditTestId); const links = await this.prisma.auditTestEvidence.findMany({ where: { organizationId: this.audits.organizationId(access), auditTestId }, include: { evidence: true, evidenceVersion: true }, orderBy: { linkedAt: 'desc' } }); return { auditTestId: test.id, data: links }; }

  async link(access: OrganizationAccess, auditTestId: string, dto: LinkAuditTestEvidenceDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); const { test, audit } = await this.tests.assertMutable(access, auditTestId);
    if ((audit.status === AuditStatus.COMPLETED || audit.status === AuditStatus.CANCELLED) || test.status === AuditTestStatus.COMPLETED) throw new ConflictException('Completed Audit Tests cannot change Evidence links');
    const evidence = await this.prisma.evidence.findFirst({ where: { organizationId, id: dto.evidenceId } }); if (!evidence) throw new NotFoundException('Evidence not found');
    const version = await this.prisma.evidenceVersion.findFirst({ where: { organizationId, id: dto.evidenceVersionId } }); if (!version) throw new NotFoundException('Evidence version not found');
    if (version.evidenceId !== dto.evidenceId) throw new ConflictException('Evidence version does not belong to the supplied Evidence');
    try { return await this.prisma.auditTestEvidence.create({ data: { organizationId, auditTestId, evidenceId: dto.evidenceId, evidenceVersionId: dto.evidenceVersionId, linkedByMembershipId: access.membership.id }, include: { evidence: true, evidenceVersion: true } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Evidence version is already linked to this Audit Test'); throw error; }
  }

  async unlink(access: OrganizationAccess, auditTestId: string, linkId: string) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.tests.assertMutable(access, auditTestId);
    const link = await this.prisma.auditTestEvidence.findFirst({ where: { organizationId, auditTestId, id: linkId } }); if (!link) throw new NotFoundException('Audit Test Evidence link not found');
    await this.prisma.auditTestEvidence.delete({ where: { organizationId_id: { organizationId, id: linkId } } }); return { deleted: true };
  }
}
