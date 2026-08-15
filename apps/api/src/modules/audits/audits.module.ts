import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { PrismaModule } from '../../database/prisma.module';

import { AuditMembersService } from './audit-members.service';
import { AuditMembersController } from './audit-members.controller';
import { AuditScopeService } from './audit-scope.service';
import { AuditScopeController } from './audit-scope.controller';
import { AuditTestEvidenceService } from './audit-test-evidence.service';
import { AuditTestEvidenceController } from './audit-test-evidence.controller';
import { AuditTestObservationsService } from './audit-test-observations.service';
import { AuditTestObservationsController } from './audit-test-observations.controller';
import { AuditTestsService } from './audit-tests.service';
import { AuditTestsController } from './audit-tests.controller';
import { AuditsController } from './audits.controller';
import { AuditsService } from './audits.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [AuditsController, AuditMembersController, AuditScopeController, AuditTestsController, AuditTestEvidenceController, AuditTestObservationsController],
  providers: [AuditsService, AuditMembersService, AuditScopeService, AuditTestsService, AuditTestEvidenceService, AuditTestObservationsService],
  exports: [AuditsService],
})
export class AuditsModule {}
