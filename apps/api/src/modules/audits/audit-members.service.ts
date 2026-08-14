import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { CreateAuditMemberDto, UpdateAuditMemberDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';

@Injectable()
export class AuditMembersService {
  constructor(private readonly prisma: PrismaService, private readonly audits: AuditsService) {}

  async list(access: OrganizationAccess, auditId: string) {
    const audit = await this.audits.getAuditRecord(access, auditId);
    return { data: audit.members.map((item: any) => ({ id: item.id, membershipId: item.membershipId, role: item.role, addedAt: item.addedAt, member: item.membership?.user ? { id: item.membership.user.id, name: item.membership.user.email } : null })) };
  }

  async add(access: OrganizationAccess, auditId: string, dto: CreateAuditMemberDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.audits.assertMutable(access, auditId); await this.audits.assertMembership(organizationId, dto.membershipId, 'membershipId');
    try { return await this.prisma.auditMember.create({ data: { organizationId, auditId, membershipId: dto.membershipId, role: dto.role, addedByMembershipId: access.membership.id } }); }
    catch (error) { if ((error as { code?: string }).code === 'P2002') throw new ConflictException('Member is already assigned to this Audit'); throw error; }
  }

  async update(access: OrganizationAccess, auditId: string, memberId: string, dto: UpdateAuditMemberDto) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.audits.assertMutable(access, auditId);
    const member = await this.prisma.auditMember.findFirst({ where: { organizationId, auditId, id: memberId } }); if (!member) throw new NotFoundException('Audit member not found');
    return this.prisma.auditMember.update({ where: { organizationId_id: { organizationId, id: memberId } }, data: { role: dto.role } });
  }

  async remove(access: OrganizationAccess, auditId: string, memberId: string) {
    this.audits.assertManage(access); const organizationId = this.audits.organizationId(access); await this.audits.assertMutable(access, auditId);
    const member = await this.prisma.auditMember.findFirst({ where: { organizationId, auditId, id: memberId } }); if (!member) throw new NotFoundException('Audit member not found');
    await this.prisma.auditMember.delete({ where: { organizationId_id: { organizationId, id: memberId } } }); return { deleted: true };
  }
}
