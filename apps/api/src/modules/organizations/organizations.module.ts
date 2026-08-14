import { Module } from '@nestjs/common';

import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../database/prisma.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationMembersController } from './organization-members.controller';
import { OrganizationMembersService } from './organization-members.service';
import { OrganizationUnitsController } from './organization-units.controller';
import { OrganizationUnitsService } from './organization-units.service';

@Module({
  imports: [PrismaModule, AuthorizationModule, AuthModule],
  controllers: [OrganizationsController, OrganizationMembersController, OrganizationUnitsController],
  providers: [OrganizationsService, OrganizationMembersService, OrganizationUnitsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
