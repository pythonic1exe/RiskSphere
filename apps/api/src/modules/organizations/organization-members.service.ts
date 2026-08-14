import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationAuthorizationService } from '../../common/authorization';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '../../database/prisma.service';
import type { ListOrganizationMembersDto, UpdateOrganizationMemberDto } from './dto';

@Injectable()
export class OrganizationMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: OrganizationAuthorizationService,
  ) {}

  private organizationId(access: OrganizationAccess) {
    return access.organization.id;
  }
  private assertManage(access: OrganizationAccess) {
    if (!this.authorization.canManageOrganization(access.roleCodes))
      throw new ForbiddenException('Not allowed to manage organization members');
  }

  async list(access: OrganizationAccess, dto: ListOrganizationMembersDto) {
    const organizationId = this.organizationId(access);
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;
    const where: Prisma.MembershipWhereInput = {
      organizationId,
      ...(dto.status ? { status: dto.status } : {}),
      ...(dto.role ? { membershipRoles: { some: { role: { code: dto.role } } } } : {}),
      ...(dto.search ? { user: { email: { contains: dto.search, mode: 'insensitive' } } } : {}),
    };
    const orderBy =
      dto.sortBy === 'email'
        ? { user: { email: dto.sortOrder ?? 'asc' } }
        : { [dto.sortBy ?? 'createdAt']: dto.sortOrder ?? 'desc' };
    const [members, total] = await Promise.all([
      this.prisma.membership.findMany({
        where,
        include: {
          user: { select: { id: true, email: true } },
          membershipRoles: { include: { role: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.membership.count({ where }),
    ]);
    return {
      data: members.map((member) => this.present(member)),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(access: OrganizationAccess, membershipId: string) {
    const member = await this.prisma.membership.findFirst({
      where: { organizationId: this.organizationId(access), id: membershipId },
      include: {
        user: { select: { id: true, email: true } },
        membershipRoles: { include: { role: true } },
      },
    });
    if (!member) throw new NotFoundException('Organization member not found');
    return this.present(member);
  }

  async update(access: OrganizationAccess, membershipId: string, dto: UpdateOrganizationMemberDto) {
    this.assertManage(access);
    const organizationId = this.organizationId(access);
    if (dto.roleCodes === undefined && dto.status === undefined)
      throw new ConflictException('At least one membership field is required');
    return this.prisma.$transaction(
      async (tx) => {
        const current = await tx.membership.findFirst({
          where: { organizationId, id: membershipId },
          include: { membershipRoles: { include: { role: true } } },
        });
        if (!current) throw new NotFoundException('Organization member not found');
        const currentOwner = current.membershipRoles.some(
          (item) => item.role.code === ORGANIZATION_ROLE_CODES.OWNER,
        );
        if (currentOwner && !access.roleCodes.includes(ORGANIZATION_ROLE_CODES.OWNER))
          throw new ForbiddenException('Only an OWNER can modify an OWNER membership');
        const targetRoles = dto.roleCodes ?? current.membershipRoles.map((item) => item.role.code);
        for (const roleCode of targetRoles) {
          if (!this.authorization.canAssignRole(access.roleCodes, roleCode))
            throw new ForbiddenException(`Not allowed to assign role ${roleCode}`);
        }
        const targetOwner = targetRoles.includes(ORGANIZATION_ROLE_CODES.OWNER);
        const ownerCount = await tx.membershipRole.count({
          where: {
            organizationId,
            role: { code: ORGANIZATION_ROLE_CODES.OWNER },
            membership: { status: 'ACTIVE' },
          },
        });
        if (
          currentOwner &&
          (!targetOwner || dto.status === 'REMOVED' || dto.status === 'SUSPENDED') &&
          ownerCount <= 1
        )
          throw new ConflictException('LAST_OWNER_CANNOT_BE_REMOVED_OR_DEMOTED');
        const roleRecords = await tx.role.findMany({
          where: { organizationId, code: { in: targetRoles } },
          select: { id: true, code: true },
        });
        if (roleRecords.length !== targetRoles.length)
          throw new ConflictException('One or more organization roles are invalid');
        const updated = await tx.membership.update({
          where: { organizationId_id: { organizationId, id: membershipId } },
          data: { ...(dto.status !== undefined ? { status: dto.status } : {}) },
          include: {
            user: { select: { id: true, email: true } },
            membershipRoles: { include: { role: true } },
          },
        });
        if (dto.roleCodes !== undefined) {
          await tx.membershipRole.deleteMany({ where: { organizationId, membershipId } });
          if (roleRecords.length)
            await tx.membershipRole.createMany({
              data: roleRecords.map((role) => ({ organizationId, membershipId, roleId: role.id })),
            });
        }
        return this.present({
          ...updated,
          membershipRoles:
            dto.roleCodes === undefined
              ? updated.membershipRoles
              : roleRecords.map((role) => ({ role })),
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async remove(access: OrganizationAccess, membershipId: string) {
    return this.update(access, membershipId, { status: 'REMOVED' });
  }
  private present(member: any) {
    return {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      email: member.user.email,
      status: member.status,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      roles: member.membershipRoles.map((item: any) => ({
        id: item.role.id,
        code: item.role.code,
        name: item.role.name,
      })),
    };
  }
}
