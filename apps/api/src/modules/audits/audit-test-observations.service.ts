import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditStatus, AuditTestStatus } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateAuditTestObservationDto, UpdateAuditTestObservationDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditTestsService } from './audit-tests.service';

@Injectable()
export class AuditTestObservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audits: AuditsService,
    private readonly tests: AuditTestsService,
  ) {}

  async list(access: OrganizationAccess, auditTestId: string) {
    await this.tests.findOne(access, auditTestId);
    return {
      data: await this.prisma.auditTestObservation
        .findMany({
          where: { organizationId: this.audits.organizationId(access), auditTestId },
          orderBy: { createdAt: 'asc' },
          include: {
            createdByMembership: { include: { user: { select: { id: true, email: true } } } },
            finding: { select: { id: true, findingNumber: true } },
          },
        })
        .then((items) =>
          items.map((item) => ({
            ...item,
            createdBy: item.createdByMembership
              ? { id: item.createdByMembership.id, name: item.createdByMembership.user.email }
              : null,
            finding: item.finding,
          })),
        ),
    };
  }

  async create(
    access: OrganizationAccess,
    auditTestId: string,
    dto: CreateAuditTestObservationDto,
  ) {
    this.audits.assertManage(access);
    const organizationId = this.audits.organizationId(access);
    const { test, audit } = await this.tests.assertMutable(access, auditTestId);
    if (
      audit.status === AuditStatus.COMPLETED ||
      audit.status === AuditStatus.CANCELLED ||
      test.status === AuditTestStatus.COMPLETED
    )
      throw new ConflictException('Completed Audit Tests cannot receive observations');
    return this.prisma.auditTestObservation.create({
      data: {
        organizationId,
        auditTestId,
        content: dto.content.trim(),
        createdByMembershipId: access.membership.id,
        updatedByMembershipId: access.membership.id,
      },
    });
  }

  async update(
    access: OrganizationAccess,
    auditTestId: string,
    observationId: string,
    dto: UpdateAuditTestObservationDto,
  ) {
    this.audits.assertManage(access);
    const organizationId = this.audits.organizationId(access);
    const { test, audit } = await this.tests.assertMutable(access, auditTestId);
    if (
      audit.status === AuditStatus.COMPLETED ||
      audit.status === AuditStatus.CANCELLED ||
      test.status === AuditTestStatus.COMPLETED
    )
      throw new ConflictException('Completed Audit Tests cannot update observations');
    const observation = await this.prisma.auditTestObservation.findFirst({
      where: { organizationId, auditTestId, id: observationId },
    });
    if (!observation) throw new NotFoundException('Observation not found');
    return this.prisma.auditTestObservation.update({
      where: { organizationId_id: { organizationId, id: observationId } },
      data: { content: dto.content.trim(), updatedByMembershipId: access.membership.id },
    });
  }

  async remove(access: OrganizationAccess, auditTestId: string, observationId: string) {
    this.audits.assertManage(access);
    const organizationId = this.audits.organizationId(access);
    const { test, audit } = await this.tests.assertMutable(access, auditTestId);
    if (
      audit.status === AuditStatus.COMPLETED ||
      audit.status === AuditStatus.CANCELLED ||
      test.status === AuditTestStatus.COMPLETED
    )
      throw new ConflictException('Completed Audit Tests cannot remove observations');
    const observation = await this.prisma.auditTestObservation.findFirst({
      where: { organizationId, auditTestId, id: observationId },
    });
    if (!observation) throw new NotFoundException('Observation not found');
    const finding = await this.prisma.finding.findFirst({
      where: { organizationId, sourceObservationId: observationId },
      select: { id: true },
    });
    if (finding) throw new ConflictException('Cannot delete an observation that has been promoted to a Finding.');
    await this.prisma.auditTestObservation.delete({
      where: { organizationId_id: { organizationId, id: observationId } },
    });
    return { deleted: true };
  }
}
