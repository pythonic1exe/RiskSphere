import { Module } from '@nestjs/common';

import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { PrismaModule } from '../../database/prisma.module';
import { AuditsModule } from '../audits/audits.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { ControlsModule } from '../controls/controls.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { FindingsModule } from '../findings/findings.module';
import { RisksModule } from '../risks/risks.module';
import { TasksModule } from '../tasks/tasks.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({ imports: [PrismaModule, AuthorizationModule, RisksModule, ControlsModule, ComplianceModule, EvidenceModule, AuditsModule, FindingsModule, TasksModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
