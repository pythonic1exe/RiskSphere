import { describe, expect, it, vi } from 'vitest';

import { AuditsService } from './audits.service';

function access() {
  return { organization: { id: 'org-1' }, membership: { id: 'member-1' }, roleCodes: ['OWNER'] } as any;
}

describe('AuditsService', () => {
  it('rejects starting an Audit without tenant-scoped scope', async () => {
    const tx = { audit: { findFirst: vi.fn().mockResolvedValue({ id: 'audit-1', organizationId: 'org-1', status: 'PLANNED', scopes: [], tests: [] }) } };
    const prisma = { $transaction: vi.fn((callback: (value: typeof tx) => unknown) => callback(tx)) } as any;
    await expect(new AuditsService(prisma).transition(access(), 'audit-1', 'IN_PROGRESS')).rejects.toThrow('at least one scope');
    expect(tx.audit.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: 'org-1', id: 'audit-1' } }));
  });

  it('rejects completing an Audit when any test lacks a result', async () => {
    const tx = { audit: { findFirst: vi.fn().mockResolvedValue({ id: 'audit-1', organizationId: 'org-1', status: 'UNDER_REVIEW', scopes: [{ id: 'scope-1' }], tests: [{ status: 'COMPLETED', result: null }] }) } };
    const prisma = { $transaction: vi.fn((callback: (value: typeof tx) => unknown) => callback(tx)) } as any;
    await expect(new AuditsService(prisma).transition(access(), 'audit-1', 'COMPLETED')).rejects.toThrow('completed with a result');
  });

  it('does not allow an unauthorized organization role to manage Audits', async () => {
    const prisma = { audit: { create: vi.fn() } } as any;
    const denied = { ...access(), roleCodes: ['VIEWER'] };
    await expect(new AuditsService(prisma).create(denied, { code: 'AUD-001', title: 'Audit', type: 'INTERNAL' } as any)).rejects.toThrow('Not allowed to manage audits');
    expect(prisma.audit.create).not.toHaveBeenCalled();
  });
});
