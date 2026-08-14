import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { FrameworksModule } from './modules/frameworks/frameworks.module';
import { RisksModule } from './modules/risks/risks.module';
import { ControlsModule } from './modules/controls/controls.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { AuditsModule } from './modules/audits/audits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    EmailModule,
    OrganizationsModule,
    InvitationsModule,
    FrameworksModule,
    RisksModule,
    ControlsModule,
    ComplianceModule,
    EvidenceModule,
    AuditsModule,
  ],
})
export class AppModule {}
