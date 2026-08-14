import { describe, expect, it, vi } from 'vitest';
import { OrganizationMembersService } from './organization-members.service';

const access = (roles = ['OWNER']) => ({ organization: { id: 'org-1' }, membership: { id: 'member-1' }, roleCodes: roles, roles: [] }) as any;
const ownerMember = { id: 'member-2', organizationId: 'org-1', userId: 'user-2', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date(), user: { id: 'user-2', email: 'owner@example.com' }, membershipRoles: [{ role: { id: 'role-owner', code: 'OWNER', name: 'Owner' } }] };

describe('OrganizationMembersService', () => {
  it('rejects removing the final owner', async () => {
    const tx = { membership: { findFirst: vi.fn().mockResolvedValue(ownerMember) }, membershipRole: { count: vi.fn().mockResolvedValue(1) } } as any;
    const prisma = { $transaction: vi.fn((callback: (value: unknown) => unknown) => callback(tx)) } as any;
    const authorization = { canManageOrganization: vi.fn().mockReturnValue(true), canAssignRole: vi.fn().mockReturnValue(true) } as any;
    await expect(new OrganizationMembersService(prisma, authorization).remove(access(), 'member-2')).rejects.toThrow('LAST_OWNER_CANNOT_BE_REMOVED_OR_DEMOTED');
  });

  it('scopes member detail by organization', async () => {
    const prisma = { membership: { findFirst: vi.fn().mockResolvedValue(null) } } as any;
    await expect(new OrganizationMembersService(prisma, {} as any).findOne(access(), 'member-from-other-org')).rejects.toThrow('Organization member not found');
    expect(prisma.membership.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: 'org-1', id: 'member-from-other-org' } }));
  });
});
