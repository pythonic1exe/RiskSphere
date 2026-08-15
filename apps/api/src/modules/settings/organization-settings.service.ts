import { ForbiddenException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationAuthorizationService } from '../../common/authorization';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { UpdateOrganizationSettingsDto } from './dto';

const DEFAULTS = { riskReviewFrequencyDays: null, findingDefaultDueDays: null, defaultTaskDueDays: null };
@Injectable()
export class OrganizationSettingsService {
  constructor(private readonly prisma: PrismaService, private readonly authorization: OrganizationAuthorizationService) {}
  async get(access: OrganizationAccess) { const value = await this.prisma.organizationSetting.findUnique({ where: { organizationId: access.organization.id } }); return value ? { riskReviewFrequencyDays: value.riskReviewFrequencyDays, findingDefaultDueDays: value.findingDefaultDueDays, defaultTaskDueDays: value.defaultTaskDueDays } : DEFAULTS; }
  async update(access: OrganizationAccess, dto: UpdateOrganizationSettingsDto) { if (!this.authorization.canManageOrganization(access.roleCodes)) throw new ForbiddenException('Not allowed to manage organization settings'); const value = await this.prisma.organizationSetting.upsert({ where: { organizationId: access.organization.id }, create: { id: randomUUID(), organizationId: access.organization.id, ...DEFAULTS, ...dto }, update: dto }); return { riskReviewFrequencyDays: value.riskReviewFrequencyDays, findingDefaultDueDays: value.findingDefaultDueDays, defaultTaskDueDays: value.defaultTaskDueDays }; }
}
