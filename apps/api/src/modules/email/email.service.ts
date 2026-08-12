import { Inject, InternalServerErrorException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

import type { SendMailOptions } from 'nodemailer';

import { renderOrganizationInvitationEmail } from './email.templates';

export type OrganizationInvitationEmailInput = {
  to: string;
  organizationName: string;
  organizationSlug: string;
  roleName: string;
  inviteToken: string;
  expiresAt: Date;
};

@Injectable()
export class EmailService {
  private transporter: Transporter | null = null;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  async sendOrganizationInvitation(input: OrganizationInvitationEmailInput) {
    const { subject, html, text } = renderOrganizationInvitationEmail({
      ...input,
      frontendUrl: this.getFrontendUrl(),
    });

    await this.sendMail({
      from: this.getFromAddress(),
      to: input.to,
      subject,
      html,
      text,
    });
  }

  private async sendMail(message: SendMailOptions) {
    await this.getTransporter().sendMail(message);
  }

  private getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.getRequiredConfig('app.smtpHost', 'SMTP_HOST');
    const port = this.getRequiredNumberConfig('app.smtpPort', 'SMTP_PORT');
    const secure = this.configService.get<boolean>('app.smtpSecure');
    const user = this.getRequiredConfig('app.smtpUser', 'SMTP_USER');
    const pass = this.getRequiredConfig('app.smtpPassword', 'SMTP_PASSWORD');

    this.transporter = createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  private getFromAddress() {
    return this.getRequiredConfig('app.emailFrom', 'EMAIL_FROM');
  }

  private getFrontendUrl() {
    return this.configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
  }

  private getRequiredConfig(key: string, envName: string) {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new InternalServerErrorException(`Missing email configuration: ${envName}`);
    }

    return value;
  }

  private getRequiredNumberConfig(key: string, envName: string) {
    const value = this.configService.get<number>(key);
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new InternalServerErrorException(`Missing email configuration: ${envName}`);
    }

    return value;
  }
}
