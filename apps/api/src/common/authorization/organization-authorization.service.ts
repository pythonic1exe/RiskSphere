import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import {
  MANAGE_ORGANIZATION_ROLE_CODES,
  ORGANIZATION_ROLE_CODES,
  type OrganizationRoleCode,
} from '../auth/auth.constants';
import type { OrganizationAccess } from '../auth/auth.types';

const ASSIGNABLE_ROLE_CODES_BY_MANAGER: Record<string, OrganizationRoleCode[]> = {
  [ORGANIZATION_ROLE_CODES.OWNER]: [
    ORGANIZATION_ROLE_CODES.OWNER,
    ORGANIZATION_ROLE_CODES.GRC_ADMIN,
    ORGANIZATION_ROLE_CODES.RISK_MANAGER,
    ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
    ORGANIZATION_ROLE_CODES.AUDITOR,
    ORGANIZATION_ROLE_CODES.CONTROL_OWNER,
    ORGANIZATION_ROLE_CODES.VIEWER,
  ],
  [ORGANIZATION_ROLE_CODES.GRC_ADMIN]: [
    ORGANIZATION_ROLE_CODES.RISK_MANAGER,
    ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
    ORGANIZATION_ROLE_CODES.AUDITOR,
    ORGANIZATION_ROLE_CODES.CONTROL_OWNER,
    ORGANIZATION_ROLE_CODES.VIEWER,
  ],
};

const ACTIVE_MEMBERSHIP_STATUS = 'ACTIVE' as const;

@Injectable()
export class OrganizationAuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(userId: string, organizationId: string): Promise<OrganizationAccess> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (
      organization.status !== 'PENDING_ONBOARDING' &&
      organization.status !== 'ACTIVE'
    ) {
      throw new ForbiddenException('Organization is not active');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        membershipRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (membership.status !== ACTIVE_MEMBERSHIP_STATUS) {
      throw new ForbiddenException('Membership is not active');
    }

    const roles = membership.membershipRoles.map((membershipRole) => membershipRole.role);
    const roleCodes = roles.map((role) => role.code as OrganizationRoleCode);

    return {
      organization,
      membership,
      roles,
      roleCodes,
    };
  }

  canManageOrganization(roleCodes: OrganizationRoleCode[]): boolean {
    return roleCodes.some((roleCode) => MANAGE_ORGANIZATION_ROLE_CODES.includes(roleCode));
  }

  canManageOnboarding(roleCodes: OrganizationRoleCode[]): boolean {
    return this.canManageOrganization(roleCodes);
  }

  canCompleteOnboarding(roleCodes: OrganizationRoleCode[]): boolean {
    return this.canManageOrganization(roleCodes);
  }

  canInviteMembers(roleCodes: OrganizationRoleCode[]): boolean {
    return this.canManageOrganization(roleCodes);
  }

  canManageFrameworkSelections(roleCodes: OrganizationRoleCode[]): boolean {
    return this.canManageOrganization(roleCodes);
  }

  canAssignRole(actorRoleCodes: OrganizationRoleCode[], targetRoleCode: string): boolean {
    if (actorRoleCodes.includes(ORGANIZATION_ROLE_CODES.OWNER)) {
      return true;
    }

    if (actorRoleCodes.includes(ORGANIZATION_ROLE_CODES.GRC_ADMIN)) {
      const allowedRoleCodes = ASSIGNABLE_ROLE_CODES_BY_MANAGER[ORGANIZATION_ROLE_CODES.GRC_ADMIN];
      return allowedRoleCodes?.includes(targetRoleCode as OrganizationRoleCode) ?? false;
    }

    return false;
  }
}
