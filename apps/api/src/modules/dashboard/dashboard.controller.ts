/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Controller, Get, InternalServerErrorException, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get the organization Dashboard overview' })
  overview(@Req() request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return this.dashboard.overview(request.organizationAccess);
  }
}
