import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, TaskActivityType, TaskStatus } from '@prisma/client';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskActivityService {
  constructor(private readonly prisma: PrismaService) {}

  append(tx: Prisma.TransactionClient | PrismaService, input: { organizationId: string; taskId: string; actorMembershipId: string; type: TaskActivityType; fromStatus?: TaskStatus; toStatus?: TaskStatus; metadata?: Prisma.InputJsonValue }) {
    return tx.taskActivity.create({ data: input });
  }

  async list(access: OrganizationAccess, taskId: string) {
    const organizationId = access.organization.id;
    const task = await this.prisma.task.findFirst({ where: { organizationId, id: taskId }, select: { id: true } });
    if (!task) throw new NotFoundException('Task not found');
    const data = await this.prisma.taskActivity.findMany({ where: { organizationId, taskId }, include: { actorMembership: { include: { user: { select: { id: true, email: true } } } } }, orderBy: { createdAt: 'asc' } });
    return { data };
  }
}
