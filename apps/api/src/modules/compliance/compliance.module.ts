import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { ComplianceFrameworksController } from './compliance-frameworks.controller';
import { ComplianceRequirementsController } from './compliance-requirements.controller';
import { ComplianceService } from './compliance.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [ComplianceFrameworksController, ComplianceRequirementsController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
