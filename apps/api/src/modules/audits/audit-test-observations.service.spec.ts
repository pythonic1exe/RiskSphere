import { describe, expect, it, vi } from 'vitest';

import { AuditTestObservationsService } from './audit-test-observations.service';

function access() {
  return { organization: { id: 'org-1' }, membership: { id: 'member-1' }, roleCodes: ['OWNER'] } as any;
}

describe('AuditTestObservationsService', () => {
  it('prevents deleting an Observation that has been promoted to a Finding', async () => {
    const prisma = {
      auditTestObservation: {
        findFirst: vi.fn()
          .mockResolvedValueOnce({ id: 'observation-1' })
          .mockResolvedValueOnce({ id: 'observation-1' }),
      },
      finding: { findFirst: vi.fn().mockResolvedValue({ id: 'finding-1' }) },
    } as any;
    const tests = { assertMutable: vi.fn().mockResolvedValue({ test: { id: 'test-1' }, audit: { status: 'IN_PROGRESS' } }) } as any;
    const audits = { assertManage: vi.fn(), organizationId: vi.fn().mockReturnValue('org-1') } as any;

    await expect(new AuditTestObservationsService(prisma, audits, tests).remove(access(), 'test-1', 'observation-1')).rejects.toThrow('promoted to a Finding');
    expect(prisma.auditTestObservation.delete).toBeUndefined();
  });
});
