import { Body, Controller, Get, InternalServerErrorException, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
import { UpdateOrganizationSettingsDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationSettingsService } from './organization-settings.service';

@ApiTags('Organization Settings') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/settings')
export class OrganizationSettingsController {
  constructor(private readonly settings: OrganizationSettingsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @ApiOperation({ summary: 'Get organization GRC defaults' }) @Get() get(@Req() req: AuthenticatedRequest, @Param('organizationId') _organizationId: string) { return this.settings.get(this.access(req)); }
  @ApiOperation({ summary: 'Update organization GRC defaults' }) @ApiBody({ type: UpdateOrganizationSettingsDto }) @Patch() update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateOrganizationSettingsDto, @Param('organizationId') _organizationId: string) { return this.settings.update(this.access(req), dto); }
}
