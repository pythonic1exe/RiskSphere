import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { ControlsController } from './controls.controller';
import { ControlsService } from './controls.service';

@Module({ imports: [PrismaModule, AuthModule, AuthorizationModule], controllers: [ControlsController], providers: [ControlsService], exports: [ControlsService] })
export class ControlsModule {}
