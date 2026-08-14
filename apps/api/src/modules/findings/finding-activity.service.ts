import { Injectable, NotFoundException } from '@nestjs/common';
import type { FindingActivityType, FindingStatus, Prisma } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FindingActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async append(
    tx: Prisma.TransactionClient | PrismaService,
    input: {
      organizationId: string;
      findingId: string;
      actorMembershipId: string;
      type: FindingActivityType;
      fromStatus?: FindingStatus;
      toStatus?: FindingStatus;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    return tx.findingActivity.create({ data: input });
  }

  async list(access: OrganizationAccess, findingId: string) {
    const organizationId = access.organization.id;
    const finding = await this.prisma.finding.findFirst({ where: { organizationId, id: findingId }, select: { id: true } });
    if (!finding) throw new NotFoundException('Finding not found');
    return {
      data: await this.prisma.findingActivity.findMany({
        where: { organizationId, findingId },
        include: { actorMembership: { include: { user: { select: { id: true, email: true } } } } },
        orderBy: { createdAt: 'asc' },
      }),
    };
  }
}
