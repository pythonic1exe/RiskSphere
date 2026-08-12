import { describe, expect, it, vi } from 'vitest';

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn().mockResolvedValue(undefined);
  const createTransport = vi.fn().mockReturnValue({
    sendMail,
  });

  return { sendMail, createTransport };
});

vi.mock('nodemailer', () => ({
  createTransport,
}));

import { EmailService } from './email.service';

describe('EmailService', () => {
  it('builds a Gmail SMTP transport and sends an invitation email', async () => {
    const configService = {
      get: (key: string) => {
        const values: Record<string, unknown> = {
          'app.smtpHost': 'smtp.gmail.com',
          'app.smtpPort': 465,
          'app.smtpSecure': true,
          'app.smtpUser': 'coutusman@gmail.com',
          'app.smtpPassword': 'app-password',
          'app.emailFrom': 'RiskSphere <coutusman@gmail.com>',
          'app.frontendUrl': 'http://localhost:3000',
        };

        return values[key];
      },
    };

    const service = new EmailService(configService as never);

    await service.sendOrganizationInvitation({
      to: 'jane@acme.com',
      organizationName: 'Acme Inc',
      organizationSlug: 'acme',
      roleName: 'Viewer',
      inviteToken: 'token-123',
      expiresAt: new Date('2026-08-20T00:00:00.000Z'),
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'coutusman@gmail.com',
        pass: 'app-password',
      },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'RiskSphere <coutusman@gmail.com>',
        to: 'jane@acme.com',
        subject: 'You have been invited to join Acme Inc on RiskSphere',
      }),
    );
  });
});
