import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FindingActivityType } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { LinkFindingEvidenceDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingActivityService } from './finding-activity.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingsService } from './findings.service';

@Injectable()
export class FindingEvidenceService {
  constructor(private readonly prisma: PrismaService, private readonly findings: FindingsService, private readonly activities: FindingActivityService) {}

  async list(access: OrganizationAccess, findingId: string) {
    await this.findings.getRecord(access, findingId);
    return { data: await this.prisma.findingEvidence.findMany({ where: { organizationId: access.organization.id, findingId }, include: { evidenceVersion: { include: { evidence: true } } }, orderBy: { createdAt: 'desc' } }) };
  }

  async link(access: OrganizationAccess, findingId: string, dto: LinkFindingEvidenceDto) {
    this.findings.assertManage(access);
    const organizationId = access.organization.id;
    const finding = await this.findings.getRecord(access, findingId);
    if (finding.status === 'CLOSED') throw new ConflictException('Closed Findings cannot change Evidence links');
    const version = await this.prisma.evidenceVersion.findFirst({ where: { organizationId, id: dto.evidenceVersionId }, select: { id: true } });
    if (!version) throw new NotFoundException('Evidence version does not belong to this organization');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const link = await tx.findingEvidence.create({ data: { organizationId, findingId, evidenceVersionId: dto.evidenceVersionId, purpose: dto.purpose, linkedByMembershipId: access.membership.id }, include: { evidenceVersion: { include: { evidence: true } } } });
        await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.EVIDENCE_LINKED, metadata: { evidenceVersionId: dto.evidenceVersionId, purpose: dto.purpose } });
        return link;
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Evidence version is already linked to this Finding');
      throw error;
    }
  }

  async unlink(access: OrganizationAccess, findingId: string, findingEvidenceId: string) {
    this.findings.assertManage(access);
    const organizationId = access.organization.id;
    const finding = await this.findings.getRecord(access, findingId);
    if (finding.status === 'CLOSED') throw new ConflictException('Closed Findings cannot change Evidence links');
    const link = await this.prisma.findingEvidence.findFirst({ where: { organizationId, findingId, id: findingEvidenceId } });
    if (!link) throw new NotFoundException('Finding Evidence link not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.findingEvidence.delete({ where: { organizationId_id: { organizationId, id: findingEvidenceId } } });
      await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.EVIDENCE_UNLINKED, metadata: { evidenceVersionId: link.evidenceVersionId, purpose: link.purpose } });
    });
    return { deleted: true };
  }
}
