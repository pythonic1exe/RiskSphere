import { describe, expect, it, vi } from 'vitest';
import { OrganizationSettingsService } from './organization-settings.service';

describe('OrganizationSettingsService', () => {
  it('returns defaults and restricts updates to managers', async () => {
    const prisma = { organizationSetting: { findUnique: vi.fn().mockResolvedValue(null), upsert: vi.fn() } };
    const authorization = { canManageOrganization: vi.fn().mockReturnValue(false) };
    const service = new OrganizationSettingsService(prisma as never, authorization as never);
    const access = { organization: { id: 'org-1' }, roleCodes: ['VIEWER'] } as never;
    await expect(service.get(access)).resolves.toEqual({ riskReviewFrequencyDays: null, findingDefaultDueDays: null, defaultTaskDueDays: null });
    await expect(service.update(access, { defaultTaskDueDays: 14 })).rejects.toMatchObject({ message: 'Not allowed to manage organization settings' });
    expect(prisma.organizationSetting.upsert).not.toHaveBeenCalled();
  });
});
