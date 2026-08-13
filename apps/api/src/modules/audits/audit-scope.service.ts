import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateAuditScopeDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';
import { validateAuditScopeTarget } from './audits.utils';

@Injectable()
export class AuditScopeService {
  constructor(private readonly prisma: PrismaService, private readonly audits: AuditsService) {}

  async list(access: OrganizationAccess, auditId: string) { const audit = await this.audits.getAuditRecord(access, auditId); return { data: audit.scopes }; }

  async add(access: OrganizationAccess, auditId: string, dto: CreateAuditScopeDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.audits.assertMutable(access, auditId);
    if (!validateAuditScopeTarget(dto.type, dto)) throw new BadRequestException('Scope target must match the selected scope type');
    if (dto.organizationFrameworkId) { const target = await this.prisma.organizationFramework.findFirst({ where: { organizationId, id: dto.organizationFrameworkId, status: 'ACTIVE' } }); if (!target) throw new NotFoundException('Organization framework not found'); }
    if (dto.organizationRequirementId) { const target = await this.prisma.organizationRequirement.findFirst({ where: { organizationId, id: dto.organizationRequirementId } }); if (!target) throw new NotFoundException('Organization requirement not found'); }
    if (dto.controlId) { const target = await this.prisma.control.findFirst({ where: { organizationId, id: dto.controlId, status: { not: 'ARCHIVED' } } }); if (!target) throw new NotFoundException('Control not found'); }
    try { return await this.prisma.auditScope.create({ data: { organizationId, auditId, type: dto.type, organizationFrameworkId: dto.organizationFrameworkId ?? null, organizationRequirementId: dto.organizationRequirementId ?? null, controlId: dto.controlId ?? null, addedByMembershipId: access.membership.id } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Scope target is already included in this Audit'); throw error; }
  }

  async remove(access: OrganizationAccess, auditId: string, scopeId: string) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.audits.assertMutable(access, auditId);
    const scope = await this.prisma.auditScope.findFirst({ where: { organizationId, auditId, id: scopeId } }); if (!scope) throw new NotFoundException('Audit scope item not found');
    await this.prisma.auditScope.delete({ where: { organizationId_id: { organizationId, id: scopeId } } }); return { deleted: true };
  }

  async isTargetInScope(access: OrganizationAccess, auditId: string, controlId?: string, organizationRequirementId?: string) {
    const organizationId = this.audits.organizationId(access); const direct = await this.prisma.auditScope.findMany({ where: { organizationId, auditId }, select: { type: true, controlId: true, organizationRequirementId: true, organizationFrameworkId: true } });
    if (organizationRequirementId && direct.some((item) => item.organizationRequirementId === organizationRequirementId)) return true;
    if (controlId && direct.some((item) => item.controlId === controlId)) return true;
    if (organizationRequirementId) { const requirement = await this.prisma.organizationRequirement.findFirst({ where: { organizationId, id: organizationRequirementId }, select: { organizationFrameworkId: true } }); return Boolean(requirement && direct.some((item) => item.organizationFrameworkId === requirement.organizationFrameworkId)); }
    if (controlId) { const link = await this.prisma.requirementControl.findFirst({ where: { organizationId, controlId }, include: { organizationRequirement: { select: { organizationFrameworkId: true } } } }); return Boolean(link && direct.some((item) => item.organizationFrameworkId === link.organizationRequirement.organizationFrameworkId)); }
    return false;
  }
}
