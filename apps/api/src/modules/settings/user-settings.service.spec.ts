import { describe, expect, it, vi } from 'vitest';
import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
  it('returns usable defaults when preference rows do not exist', async () => {
    const prisma = {
      userPreference: { findUnique: vi.fn().mockResolvedValue(null) },
      notificationPreference: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new UserSettingsService(prisma as never);
    await expect(service.preferences('user-1')).resolves.toEqual({ timezone: null, dateFormat: 'DD/MM/YYYY', startPage: '/workspace', density: 'COMFORTABLE' });
    await expect(service.notifications('user-1')).resolves.toEqual({ inAppEnabled: true, emailEnabled: true });
  });

  it('rejects an invalid current password before updating sessions', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue({ id: 'user-1', passwordHash: 'not-a-password' }) }, session: { updateMany: vi.fn() }, $transaction: vi.fn() };
    const service = new UserSettingsService(prisma as never);
    await expect(service.changePassword('user-1', 'session-1', { currentPassword: 'wrong', newPassword: 'new-password' })).rejects.toMatchObject({ message: 'INVALID_CURRENT_PASSWORD' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
