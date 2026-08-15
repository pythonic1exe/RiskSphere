import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { PrismaModule } from '../../database/prisma.module';
import { OrganizationSettingsController } from './organization-settings.controller';
import { OrganizationSettingsService } from './organization-settings.service';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';

@Module({ imports: [PrismaModule, AuthModule, AuthorizationModule], controllers: [UserSettingsController, OrganizationSettingsController], providers: [UserSettingsService, OrganizationSettingsService] })
export class SettingsModule {}
