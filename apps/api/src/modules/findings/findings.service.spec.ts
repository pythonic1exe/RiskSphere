import { describe, expect, it, vi } from 'vitest';

import { FindingsService } from './findings.service';

function access(roleCodes = ['OWNER']) {
  return { organization: { id: 'org-1' }, membership: { id: 'member-1' }, roleCodes } as any;
}

function finding(overrides: Record<string, unknown> = {}) {
  return {
    id: 'finding-1', organizationId: 'org-1', findingNumber: 'FND-2026-0001', title: 'Issue', description: 'Issue',
    severity: 'HIGH', status: 'OPEN', sourceType: 'MANUAL', sourceObservationId: null, ownerMembershipId: null,
    rootCause: null, impact: null, recommendation: null, remediationPlan: null, dueDate: null,
    resolutionType: null, resolutionRationale: null, openedAt: new Date(), submittedForValidationAt: null, closedAt: null,
    createdByMembershipId: 'member-1', updatedByMembershipId: 'member-1', createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  };
}

describe('FindingsService', () => {
  it('creates a tenant-scoped manual Finding with a transaction-safe number', async () => {
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ allocated: 1 }]),
      finding: { create: vi.fn().mockResolvedValue(finding()) },
    } as any;
    const prisma = {
      membership: { findFirst: vi.fn().mockResolvedValue({ id: 'member-2' }) },
      $transaction: vi.fn((callback: (value: typeof tx) => unknown) => callback(tx)),
    } as any;
    const activities = { append: vi.fn() } as any;

    const result = await new FindingsService(prisma, activities).create(access(), { title: 'Issue', severity: 'HIGH', ownerMembershipId: 'member-2' } as any);

    expect(result.findingNumber).toBe('FND-2026-0001');
    expect(tx.$queryRaw).toHaveBeenCalledOnce();
    expect(tx.finding.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ sourceType: 'MANUAL', organizationId: 'org-1' }) }));
    expect(activities.append).toHaveBeenCalledOnce();
  });

  it('rejects promotion from a cancelled Audit before creating a Finding', async () => {
    const prisma = {
      auditTestObservation: { findFirst: vi.fn().mockResolvedValue({ finding: null, content: 'Observation', auditTest: { audit: { status: 'CANCELLED' } } }) },
    } as any;
    const service = new FindingsService(prisma, {} as any);

    await expect(service.promoteObservation(access(), 'test-1', 'observation-1', { title: 'Finding', severity: 'HIGH' } as any)).rejects.toThrow('Cancelled Audits');
  });

  it('rejects a second promotion of the same Observation', async () => {
    const prisma = {
      auditTestObservation: { findFirst: vi.fn().mockResolvedValue({ finding: { id: 'finding-1' }, content: 'Observation', auditTest: { audit: { status: 'COMPLETED' } } }) },
    } as any;
    const service = new FindingsService(prisma, {} as any);

    await expect(service.promoteObservation(access(), 'test-1', 'observation-1', { title: 'Finding', severity: 'HIGH' } as any)).rejects.toThrow('already been promoted');
  });

  it('blocks validation submission while non-cancelled Finding Tasks remain incomplete', async () => {
    const prisma = {
      finding: { findFirst: vi.fn().mockResolvedValue(finding({ status: 'IN_REMEDIATION', ownerMembershipId: 'member-2', remediationPlan: 'Plan' })) },
      findingEvidence: { count: vi.fn().mockResolvedValue(1) },
      task: { count: vi.fn().mockResolvedValue(1) },
    } as any;
    const service = new FindingsService(prisma, {} as any);

    await expect(service.submitForValidation(access(), 'finding-1')).rejects.toThrow('remediation tasks remain incomplete');
    expect(prisma.task.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ findingId: 'finding-1', status: { notIn: ['DONE', 'CANCELLED'] } }) }));
  });
});
