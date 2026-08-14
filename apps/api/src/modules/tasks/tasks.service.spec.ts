import { describe, expect, it, vi } from 'vitest';

import { TasksService } from './tasks.service';

function access(roleCodes = ['OWNER'], membershipId = 'member-1') { return { organization: { id: 'org-1' }, membership: { id: membershipId }, roleCodes } as any; }
function task(overrides: Record<string, unknown> = {}) {
  return { id: 'task-1', organizationId: 'org-1', taskNumber: 'TSK-2026-0001', title: 'Task', description: null, status: 'TODO', priority: 'HIGH', sourceType: 'MANUAL', findingId: null, assigneeMembershipId: null, dueDate: null, startedAt: null, completedAt: null, cancelledAt: null, blockedReason: null, completionNotes: null, cancellationReason: null, createdByMembershipId: 'member-1', updatedByMembershipId: 'member-1', createdAt: new Date(), updatedAt: new Date(), assigneeMembership: null, finding: null, ...overrides };
}

describe('TasksService', () => {
  it('creates a tenant-scoped manual Task with an atomic human-readable number', async () => {
    const created = task();
    const tx = { $queryRaw: vi.fn().mockResolvedValue([{ allocated: 1 }]), task: { create: vi.fn().mockResolvedValue(created) } } as any;
    const prisma = { membership: { findFirst: vi.fn().mockResolvedValue({ id: 'member-2' }) }, $transaction: vi.fn((callback: (value: typeof tx) => unknown) => callback(tx)) } as any;
    const activities = { append: vi.fn() } as any;

    const result = await new TasksService(prisma, activities).create(access(), { title: 'Task', priority: 'HIGH', assigneeMembershipId: 'member-2' } as any);

    expect(result.taskNumber).toBe('TSK-2026-0001');
    expect(tx.$queryRaw).toHaveBeenCalledOnce();
    expect(tx.task.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ organizationId: 'org-1', sourceType: 'MANUAL', findingId: null }) }));
    expect(activities.append).toHaveBeenCalledOnce();
  });

  it('rejects Finding Task creation for a closed Finding', async () => {
    const prisma = { finding: { findFirst: vi.fn().mockResolvedValue({ id: 'finding-1', status: 'CLOSED' }) } } as any;
    await expect(new TasksService(prisma, {} as any).createForFinding(access(), 'finding-1', { title: 'Task', priority: 'HIGH' } as any)).rejects.toThrow('Cannot create remediation Tasks');
  });

  it('does not allow an unassigned Task to start', async () => {
    const prisma = { task: { findFirst: vi.fn().mockResolvedValue(task()) }, $transaction: vi.fn((callback: (value: unknown) => unknown) => callback({ task: {} })) } as any;
    await expect(new TasksService(prisma, {} as any).start(access(), 'task-1')).rejects.toThrow('unassigned');
  });

  it('allows an assignee to start their own Task and records the transition', async () => {
    const current = task({ assigneeMembershipId: 'member-1' });
    const updated = task({ assigneeMembershipId: 'member-1', status: 'IN_PROGRESS', startedAt: new Date() });
    const tx = { task: { updateMany: vi.fn().mockResolvedValue({ count: 1 }), findUniqueOrThrow: vi.fn().mockResolvedValue(updated) } } as any;
    const prisma = { task: { findFirst: vi.fn().mockResolvedValue(current) }, $transaction: vi.fn((callback: (value: typeof tx) => unknown) => callback(tx)) } as any;
    const activities = { append: vi.fn() } as any;

    const result = await new TasksService(prisma, activities).start(access([], 'member-1'), 'task-1');

    expect(result.status).toBe('IN_PROGRESS');
    expect(tx.task.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: 'TODO', organizationId: 'org-1' }) }));
    expect(activities.append).toHaveBeenCalledWith(tx, expect.objectContaining({ type: 'STARTED', fromStatus: 'TODO', toStatus: 'IN_PROGRESS' }));
  });
});
