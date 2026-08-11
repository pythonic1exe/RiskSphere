import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { OrganizationRoleGuard } from './organization-role.guard';

@Module({
  imports: [PrismaModule],
  providers: [OrganizationAuthorizationService, OrganizationRoleGuard],
  exports: [OrganizationAuthorizationService, OrganizationRoleGuard],
})
export class AuthorizationModule {}

