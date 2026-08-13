import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { AuthModule } from '../auth/auth.module';
import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';

@Module({ imports: [PrismaModule, AuthorizationModule, AuthModule], controllers: [RisksController], providers: [RisksService], exports: [RisksService] })
export class RisksModule {}
