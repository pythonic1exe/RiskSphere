import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Organization, type OrganizationOnboarding } from '@prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../../database/prisma.service';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
import { generateTokenId } from '../../common/auth/jwt.util';
import { OrganizationAuthorizationService } from '../../common/authorization';
import type { CreateOrganizationDto } from './dto/create-organization.dto';
import type { UpdateOnboardingProgressDto } from './dto/update-onboarding-progress.dto';
import type { UpdateOrganizationDto } from './dto/update-organization.dto';

const DEFAULT_ORGANIZATION_ROLES = [
  {
    code: ORGANIZATION_ROLE_CODES.OWNER,
    name: 'Organization Owner',
    description: 'Full control over the organization and onboarding flow',
  },
  {
    code: ORGANIZATION_ROLE_CODES.GRC_ADMIN,
    name: 'GRC Admin',
    description: 'Can manage onboarding, invitations, and GRC setup',
  },
  {
    code: ORGANIZATION_ROLE_CODES.RISK_MANAGER,
    name: 'Risk Manager',
    description: 'Manages risk-related work',
  },
  {
    code: ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER,
    name: 'Compliance Manager',
    description: 'Manages compliance-related work',
  },
  {
    code: ORGANIZATION_ROLE_CODES.AUDITOR,
    name: 'Auditor',
    description: 'Supports audit workflows',
  },
  {
    code: ORGANIZATION_ROLE_CODES.CONTROL_OWNER,
    name: 'Control Owner',
    description: 'Owns and executes controls',
  },
  {
    code: ORGANIZATION_ROLE_CODES.VIEWER,
    name: 'Viewer',
    description: 'Read-only access',
  },
] as const;

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorizationService: OrganizationAuthorizationService,
  ) {}

  async createOrganization(creatorUserId: string, dto: CreateOrganizationDto) {
    const slug = dto.slug.trim().toLowerCase();
    const name = dto.name.trim();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            slug,
            name,
            timezone: dto.timezone?.trim() || null,
            locale: dto.locale?.trim() || null,
            status: 'PENDING_ONBOARDING',
          },
        });

        const onboarding = await tx.organizationOnboarding.create({
          data: {
            id: generateTokenId(),
            organizationId: organization.id,
            status: 'IN_PROGRESS',
            currentStep: 'GRC_GOALS',
            lastStep: 'ORGANIZATION_SETUP',
          },
        });

        const createdRoles = await Promise.all(
          DEFAULT_ORGANIZATION_ROLES.map((role) =>
            tx.role.create({
              data: {
                id: randomUUID(),
                organizationId: organization.id,
                code: role.code,
                name: role.name,
                description: role.description,
              },
            }),
          ),
        );

        const ownerRole = createdRoles.find((role) => role.code === ORGANIZATION_ROLE_CODES.OWNER);
        if (!ownerRole) {
          throw new InternalServerErrorException('Owner role was not created');
        }

        const membership = await tx.membership.create({
          data: {
            organizationId: organization.id,
            userId: creatorUserId,
            status: 'ACTIVE',
          },
        });

        await tx.membershipRole.create({
          data: {
            organizationId: organization.id,
            membershipId: membership.id,
            roleId: ownerRole.id,
          },
        });

        return {
          organization,
          onboarding,
          membership,
          roles: createdRoles,
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Organization slug already exists');
      }

      throw error;
    }
  }

  async getOnboarding(access: OrganizationAccess) {
    const [organization, onboarding] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: access.organization.id },
      }),
      this.prisma.organizationOnboarding.findUnique({
        where: { organizationId: access.organization.id },
      }),
    ]);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!onboarding) {
      throw new NotFoundException('Organization onboarding not found');
    }

    const [inviteCount, selectedFrameworkCount] = await Promise.all([
      this.prisma.invitation.count({
        where: {
          organizationId: access.organization.id,
          status: 'PENDING',
        },
      }),
      this.prisma.organizationFrameworkSelection.count({
        where: {
          organizationId: access.organization.id,
        },
      }),
    ]);

    return {
      organization,
      onboarding,
      resume: {
        currentStep: onboarding.currentStep,
        lastStep: onboarding.lastStep,
      },
      readiness: {
        canComplete: this.canCompleteOnboarding(organization, onboarding),
      },
      counts: {
        pendingInvitations: inviteCount,
        selectedFrameworks: selectedFrameworkCount,
      },
    };
  }

  async updateOrganization(access: OrganizationAccess, dto: UpdateOrganizationDto) {
    if (
      !this.authorizationService.canManageOrganization(access.roleCodes)
    ) {
      throw new ForbiddenException('Not allowed to manage this organization');
    }

    try {
      const data: {
        name?: string;
        slug?: string;
        timezone?: string | null;
        locale?: string | null;
      } = {};

      if (dto.name !== undefined) {
        data.name = dto.name.trim();
      }
      if (dto.slug !== undefined) {
        data.slug = dto.slug.trim().toLowerCase();
      }
      if (dto.timezone !== undefined) {
        data.timezone = dto.timezone.trim() || null;
      }
      if (dto.locale !== undefined) {
        data.locale = dto.locale.trim() || null;
      }

      const organization = await this.prisma.organization.update({
        where: {
          id: access.organization.id,
        },
        data,
      });

      return { organization };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Organization slug already exists');
      }

      throw error;
    }
  }

  async updateOnboardingProgress(access: OrganizationAccess, dto: UpdateOnboardingProgressDto) {
    if (
      !this.authorizationService.canManageOnboarding(access.roleCodes)
    ) {
      throw new ForbiddenException('Not allowed to manage onboarding');
    }

    if (dto.currentStep === undefined && dto.lastStep === undefined) {
      throw new BadRequestException('At least one onboarding progress field is required');
    }

    const data: Prisma.OrganizationOnboardingUpdateInput = {};

    if (dto.currentStep !== undefined) {
      data.currentStep = dto.currentStep;
    }
    if (dto.lastStep !== undefined) {
      data.lastStep = dto.lastStep;
    }

    const onboarding = await this.prisma.organizationOnboarding.update({
      where: { organizationId: access.organization.id },
      data,
    });

    return { onboarding };
  }

  async completeOnboarding(access: OrganizationAccess) {
    if (!this.authorizationService.canCompleteOnboarding(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to complete onboarding');
    }

    return this.prisma.$transaction(async (tx) => {
      const [organization, onboarding] = await Promise.all([
        tx.organization.findUnique({
          where: { id: access.organization.id },
        }),
        tx.organizationOnboarding.findUnique({
          where: { organizationId: access.organization.id },
        }),
      ]);

      if (!organization) {
        throw new NotFoundException('Organization not found');
      }

      if (!onboarding) {
        throw new NotFoundException('Organization onboarding not found');
      }

      if (organization.status === 'ACTIVE' && onboarding.status === 'COMPLETED') {
        return {
          organization,
          onboarding,
        };
      }

      if (!this.canCompleteOnboarding(organization, onboarding)) {
        throw new BadRequestException('Organization onboarding is not ready to complete');
      }

      const completedAt = new Date();

      const updatedOnboarding = await tx.organizationOnboarding.update({
        where: { organizationId: organization.id },
        data: {
          status: 'COMPLETED',
          completedAt,
        },
      });

      const updatedOrganization = await tx.organization.update({
        where: { id: organization.id },
        data: {
          status: 'ACTIVE',
          onboardingCompletedAt: completedAt,
        },
      });

      return {
        organization: updatedOrganization,
        onboarding: updatedOnboarding,
      };
    });
  }

  async getOrganizationAccess(userId: string, organizationId: string) {
    return this.authorizationService.getAccess(userId, organizationId);
  }

  private canCompleteOnboarding(
    organization: Organization,
    onboarding: OrganizationOnboarding,
  ): boolean {
    const hasAuthoritativeProgress =
      organization.updatedAt.getTime() > organization.createdAt.getTime() ||
      onboarding.updatedAt.getTime() > onboarding.createdAt.getTime();

    return (
      organization.status === 'PENDING_ONBOARDING' &&
      onboarding.status === 'IN_PROGRESS' &&
      hasAuthoritativeProgress
    );
  }
}
