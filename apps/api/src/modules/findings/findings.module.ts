import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { PrismaModule } from '../../database/prisma.module';
import { FindingActivityController } from './finding-activity.controller';
import { FindingActivityService } from './finding-activity.service';
import { FindingPromotionsController } from './finding-promotions.controller';
import { FindingEvidenceController } from './finding-evidence.controller';
import { FindingEvidenceService } from './finding-evidence.service';
import { FindingValidationsController } from './finding-validations.controller';
import { FindingValidationsService } from './finding-validations.service';
import { FindingsController } from './findings.controller';
import { FindingsService } from './findings.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [FindingsController, FindingPromotionsController, FindingEvidenceController, FindingValidationsController, FindingActivityController],
  providers: [FindingsService, FindingEvidenceService, FindingValidationsService, FindingActivityService],
  exports: [FindingsService],
})
export class FindingsModule {}
