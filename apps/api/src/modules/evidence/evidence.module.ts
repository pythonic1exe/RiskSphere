import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { EVIDENCE_STORAGE_SERVICE, LocalEvidenceStorageService } from './evidence-storage.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, LocalEvidenceStorageService, { provide: EVIDENCE_STORAGE_SERVICE, useExisting: LocalEvidenceStorageService }],
})
export class EvidenceModule {}
