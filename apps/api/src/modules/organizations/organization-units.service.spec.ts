import { describe, expect, it, vi } from 'vitest';
import { OrganizationUnitsService } from './organization-units.service';

const access = { organization: { id: 'org-1' }, membership: { id: 'member-1' }, roleCodes: ['OWNER'], roles: [] } as any;

describe('OrganizationUnitsService', () => {
  it('creates a root unit with tenant scope', async () => {
    const created = { id: 'unit-1', organizationId: 'org-1', name: 'Security', code: null, description: null, parentId: null, isActive: true, createdAt: new Date(), updatedAt: new Date(), _count: { children: 0, members: 0 } };
    const tx = { organizationUnit: { findFirst: vi.fn(), create: vi.fn().mockResolvedValue(created) } } as any;
    const prisma = { $transaction: vi.fn((callback: (value: unknown) => unknown) => callback(tx)) } as any;
    const authorization = { canManageOrganization: vi.fn().mockReturnValue(true) } as any;
    const result = await new OrganizationUnitsService(prisma, authorization).create(access, { name: 'Security' });
    expect(result.organizationId).toBe('org-1');
    expect(tx.organizationUnit.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: 'org-1', parentId: null }) }));
  });

  it('rejects a parent cycle', async () => {
    const tx = { organizationUnit: { findFirst: vi.fn().mockImplementation(({ where }: any) => where.id === 'unit-1' ? { id: 'unit-1', parentId: 'unit-2' } : { id: 'unit-2', parentId: 'unit-1' }) } } as any;
    const prisma = { $transaction: vi.fn((callback: (value: unknown) => unknown) => callback(tx)) } as any;
    const authorization = { canManageOrganization: vi.fn().mockReturnValue(true) } as any;
    await expect(new OrganizationUnitsService(prisma, authorization).update(access, 'unit-1', { name: 'Security', parentId: 'unit-2' })).rejects.toThrow('ORGANIZATION_UNIT_CIRCULAR_PARENT');
  });
});
