import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { FindingActivityType, FindingResolutionType, FindingStatus, FindingValidationDecision } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateFindingValidationDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingActivityService } from './finding-activity.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingsService } from './findings.service';
import { mapFinding } from './finding-presentation.utils';

@Injectable()
export class FindingValidationsService {
  constructor(private readonly prisma: PrismaService, private readonly findings: FindingsService, private readonly activities: FindingActivityService) {}

  async list(access: OrganizationAccess, findingId: string) {
    await this.findings.getRecord(access, findingId);
    return { data: await this.prisma.findingValidation.findMany({ where: { organizationId: access.organization.id, findingId }, include: { reviewerMembership: { include: { user: { select: { id: true, email: true } } } } }, orderBy: { createdAt: 'asc' } }) };
  }

  async create(access: OrganizationAccess, findingId: string, dto: CreateFindingValidationDto) {
    this.findings.assertManage(access);
    const organizationId = access.organization.id;
    const current = await this.findings.getRecord(access, findingId);
    if (current.status !== FindingStatus.READY_FOR_VALIDATION) throw new ConflictException('Finding must be ready for validation');
    const incompleteTasks = await this.prisma.task.count({ where: { organizationId, findingId, status: { notIn: ['DONE', 'CANCELLED'] } } });
    if (incompleteTasks > 0) throw new ConflictException('Cannot validate Finding while remediation tasks remain incomplete.');
    if (dto.decision === FindingValidationDecision.REJECTED && !dto.notes?.trim()) throw new BadRequestException('Validation notes are required when remediation is rejected');
    if (dto.decision === FindingValidationDecision.ACCEPTED && dto.resolutionType && dto.resolutionType !== FindingResolutionType.REMEDIATED) throw new BadRequestException('Accepted validation must use REMEDIATED resolution');
    const nextStatus = dto.decision === FindingValidationDecision.ACCEPTED ? FindingStatus.CLOSED : FindingStatus.IN_REMEDIATION;
    const activityType = dto.decision === FindingValidationDecision.ACCEPTED ? FindingActivityType.VALIDATION_ACCEPTED : FindingActivityType.VALIDATION_REJECTED;
    const resolutionType = dto.decision === FindingValidationDecision.ACCEPTED ? FindingResolutionType.REMEDIATED : null;
    return this.prisma.$transaction(async (tx) => {
      const validation = await tx.findingValidation.create({ data: { organizationId, findingId, reviewerMembershipId: access.membership.id, decision: dto.decision, notes: dto.notes?.trim() || null, resolutionType, resolutionRationale: dto.resolutionRationale?.trim() || null } });
      const finding = await tx.finding.update({ where: { organizationId_id: { organizationId, id: findingId } }, data: { status: nextStatus, closedAt: nextStatus === FindingStatus.CLOSED ? new Date() : null, resolutionType, resolutionRationale: dto.resolutionRationale?.trim() || (resolutionType === FindingResolutionType.REMEDIATED ? 'Accepted through validation' : null), updatedByMembershipId: access.membership.id } });
      await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: activityType, fromStatus: current.status, toStatus: nextStatus, metadata: { validationId: validation.id, decision: dto.decision } });
      if (nextStatus === FindingStatus.CLOSED) await this.activities.append(tx, { organizationId, findingId, actorMembershipId: access.membership.id, type: FindingActivityType.CLOSED, fromStatus: FindingStatus.READY_FOR_VALIDATION, toStatus: FindingStatus.CLOSED, metadata: { validationId: validation.id } });
      return { validation, finding: mapFinding(finding) };
    });
  }
}
