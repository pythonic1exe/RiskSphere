import {
  BadRequestException,
  ConflictException,
  Inject,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

import { PrismaService } from '../../database/prisma.service';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { OrganizationAccess } from '../../common/auth/auth.types';
import { OrganizationAuthorizationService } from '../../common/authorization';
import { EmailService } from '../email';
import type { AcceptInvitationDto } from './dto/accept-invitation.dto';
import type { CreateInvitationDto } from './dto/create-invitation.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('base64url');
}

const INVITATION_TTL_DAYS = 7;

@Injectable()
export class InvitationsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OrganizationAuthorizationService)
    private readonly authorizationService: OrganizationAuthorizationService,
    @Inject(EmailService) private readonly emailService: EmailService,
  ) {}

  async createInvitation(access: OrganizationAccess, dto: CreateInvitationDto) {
    if (!this.authorizationService.canInviteMembers(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to invite members');
    }

    if (dto.roleCode === ORGANIZATION_ROLE_CODES.OWNER) {
      throw new BadRequestException('Owner role cannot be assigned through invitations');
    }

    if (!this.authorizationService.canAssignRole(access.roleCodes, dto.roleCode)) {
      throw new ForbiddenException('Not allowed to assign that role');
    }

    const normalizedEmail = normalizeEmail(dto.email);

    const existingPendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        organizationId: access.organization.id,
        invitedEmailNormalized: normalizedEmail,
        status: 'PENDING',
      },
    });

    if (existingPendingInvitation) {
      throw new ConflictException('An active invitation already exists for this email');
    }

    const role = await this.prisma.role.findUnique({
      where: {
        organizationId_code: {
          organizationId: access.organization.id,
          code: dto.roleCode,
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const rawToken = randomBytes(32).toString('base64url');
    const invitation = await this.prisma.invitation.create({
      data: {
        organizationId: access.organization.id,
        invitedByMembershipId: access.membership.id,
        invitedEmail: normalizedEmail,
        invitedEmailNormalized: normalizedEmail,
        tokenHash: hashToken(rawToken),
        status: 'PENDING',
        roleId: role.id,
        expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    try {
      await this.emailService.sendOrganizationInvitation({
        to: normalizedEmail,
        organizationName: access.organization.name,
        organizationSlug: access.organization.slug,
        roleName: role.name,
        inviteToken: rawToken,
        expiresAt: invitation.expiresAt,
      });
    } catch {
      await this.prisma.invitation
        .delete({
          where: { id: invitation.id },
        })
        .catch(() => undefined);

      throw new InternalServerErrorException('Unable to send invitation email');
    }

    return {
      invitation,
      inviteToken: rawToken,
      role,
    };
  }

  async revokeInvitation(access: OrganizationAccess, invitationId: string) {
    if (!this.authorizationService.canInviteMembers(access.roleCodes)) {
      throw new ForbiddenException('Not allowed to revoke invitations');
    }

    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.organizationId !== access.organization.id) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new ConflictException('Accepted invitations cannot be revoked');
    }

    const updated = await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedByMembershipId: access.membership.id,
      },
    });

    return {
      invitation: updated,
    };
  }

  async acceptInvitation(userId: string, email: string, dto: AcceptInvitationDto) {
    const normalizedEmail = normalizeEmail(email);
    const tokenHash = hashToken(dto.token);
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash },
      include: {
        role: true,
        organization: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedEmailNormalized !== normalizedEmail) {
      throw new ForbiddenException('Invitation email does not match the authenticated user');
    }

    if (invitation.status === 'REVOKED') {
      throw new ConflictException('Invitation has been revoked');
    }

    if (invitation.expiresAt.getTime() <= Date.now()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new ConflictException('Invitation has expired');
    }

    if (invitation.status === 'ACCEPTED') {
      if (invitation.acceptedByUserId === userId && invitation.acceptedMembershipId) {
        const membership = await this.prisma.membership.findUnique({
          where: {
            organizationId_userId: {
              organizationId: invitation.organizationId,
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
          throw new ConflictException('Invitation was already accepted');
        }

        return {
          invitation,
          membership,
          roles: membership.membershipRoles.map((membershipRole) => membershipRole.role),
          organization: invitation.organization,
        };
      }

      throw new ConflictException('Invitation has already been accepted');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const membership = await tx.membership.create({
          data: {
            organizationId: invitation.organizationId,
            userId,
            status: 'ACTIVE',
          },
        });

        await tx.membershipRole.create({
          data: {
            organizationId: invitation.organizationId,
            membershipId: membership.id,
            roleId: invitation.roleId,
          },
        });

        const updatedInvitation = await tx.invitation.updateMany({
          where: {
            id: invitation.id,
            status: 'PENDING',
          },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
            acceptedByUserId: userId,
            acceptedMembershipId: membership.id,
          },
        });

        if (updatedInvitation.count !== 1) {
          throw new ConflictException('Invitation is no longer available');
        }

        return {
          invitationId: invitation.id,
          organizationId: invitation.organizationId,
          userId,
          membershipId: membership.id,
        };
      });

      const membershipWithRoles = await this.prisma.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: result.organizationId,
            userId: result.userId,
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

      if (!membershipWithRoles) {
        throw new ConflictException('Membership could not be loaded after invitation acceptance');
      }

      return {
        invitation: {
          ...invitation,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          acceptedByUserId: userId,
          acceptedMembershipId: membershipWithRoles.id,
        },
        membership: membershipWithRoles,
        roles: membershipWithRoles.membershipRoles.map((membershipRole) => membershipRole.role),
        organization: invitation.organization,
      };
    } catch (error) {
      const isIdempotentReplay =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

      const isNoLongerAvailable =
        error instanceof ConflictException &&
        typeof error.message === 'string' &&
        error.message.includes('Invitation is no longer available');

      if (isIdempotentReplay || isNoLongerAvailable) {
        const latestInvitation = await this.prisma.invitation.findUnique({
          where: { tokenHash },
          include: {
            role: true,
            organization: true,
          },
        });

        if (
          latestInvitation?.status === 'ACCEPTED' &&
          latestInvitation.acceptedByUserId === userId &&
          latestInvitation.acceptedMembershipId
        ) {
          const membership = await this.prisma.membership.findUnique({
            where: {
              organizationId_userId: {
                organizationId: latestInvitation.organizationId,
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
            throw new ConflictException('Membership could not be loaded after invitation acceptance');
          }

          return {
            invitation: latestInvitation,
            membership,
            roles: membership.membershipRoles.map((membershipRole) => membershipRole.role),
            organization: latestInvitation.organization,
          };
        }

        const existingMembership = await this.prisma.membership.findUnique({
          where: {
            organizationId_userId: {
              organizationId: invitation.organizationId,
              userId,
            },
          },
        });

        if (existingMembership) {
          throw new ConflictException('User is already a member of this organization');
        }
      }

      throw error;
    }
  }
}
