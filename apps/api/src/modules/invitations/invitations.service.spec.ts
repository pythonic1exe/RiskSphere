import { describe, expect, it, vi } from 'vitest';

import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import { InvitationsService } from './invitations.service';

describe('InvitationsService', () => {
  it('sends an invitation email after creating an invitation', async () => {
    const prisma = {
      invitation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 'invite-1',
          organizationId: 'org-1',
          invitedByMembershipId: 'membership-1',
          invitedEmail: 'jane@acme.com',
          invitedEmailNormalized: 'jane@acme.com',
          tokenHash: 'hash-1',
          status: 'PENDING',
          roleId: 'role-1',
          expiresAt: new Date('2026-08-20T00:00:00.000Z'),
        }),
        delete: vi.fn(),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'role-1',
          code: ORGANIZATION_ROLE_CODES.VIEWER,
          name: 'Viewer',
        }),
      },
    };

    const authorizationService = {
      canInviteMembers: vi.fn().mockReturnValue(true),
      canAssignRole: vi.fn().mockReturnValue(true),
    };

    const emailService = {
      sendOrganizationInvitation: vi.fn().mockResolvedValue(undefined),
    };

    const service = new InvitationsService(
      prisma as never,
      authorizationService as never,
      emailService as never,
    );

    const result = await service.createInvitation(
      {
        organization: {
          id: 'org-1',
          slug: 'acme',
          name: 'Acme Inc',
        },
        membership: {
          id: 'membership-1',
        },
        roleCodes: [ORGANIZATION_ROLE_CODES.OWNER],
        roles: [],
      } as never,
      {
        email: 'jane@acme.com',
        roleCode: ORGANIZATION_ROLE_CODES.VIEWER,
      },
    );

    expect(result.inviteToken).toBeDefined();
    expect(emailService.sendOrganizationInvitation).toHaveBeenCalledTimes(1);
    expect(emailService.sendOrganizationInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@acme.com',
        organizationName: 'Acme Inc',
        organizationSlug: 'acme',
        roleName: 'Viewer',
        inviteToken: expect.any(String),
      }),
    );
  });

  it('removes a created invitation when email sending fails', async () => {
    const prisma = {
      invitation: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 'invite-1',
          organizationId: 'org-1',
          invitedByMembershipId: 'membership-1',
          invitedEmail: 'jane@acme.com',
          invitedEmailNormalized: 'jane@acme.com',
          tokenHash: 'hash-1',
          status: 'PENDING',
          roleId: 'role-1',
          expiresAt: new Date('2026-08-20T00:00:00.000Z'),
        }),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      role: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'role-1',
          code: ORGANIZATION_ROLE_CODES.VIEWER,
          name: 'Viewer',
        }),
      },
    };

    const authorizationService = {
      canInviteMembers: vi.fn().mockReturnValue(true),
      canAssignRole: vi.fn().mockReturnValue(true),
    };

    const emailService = {
      sendOrganizationInvitation: vi.fn().mockRejectedValue(new Error('smtp down')),
    };

    const service = new InvitationsService(
      prisma as never,
      authorizationService as never,
      emailService as never,
    );

    await expect(
      service.createInvitation(
        {
          organization: {
            id: 'org-1',
            slug: 'acme',
            name: 'Acme Inc',
          },
          membership: {
            id: 'membership-1',
          },
          roleCodes: [ORGANIZATION_ROLE_CODES.OWNER],
          roles: [],
        } as never,
        {
          email: 'jane@acme.com',
          roleCode: ORGANIZATION_ROLE_CODES.VIEWER,
        },
      ),
    ).rejects.toMatchObject({
      message: 'Unable to send invitation email',
    });

    expect(prisma.invitation.delete).toHaveBeenCalledWith({
      where: { id: 'invite-1' },
    });
  });
});
