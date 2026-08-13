import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
// DTO classes are runtime values for Nest ValidationPipe and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AdoptFrameworkDto, ListComplianceFrameworksDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ComplianceService } from './compliance.service';

@ApiTags('Compliance Frameworks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/compliance/frameworks')
export class ComplianceFrameworksController {
  constructor(private readonly complianceService: ComplianceService) {}

  private access(request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return request.organizationAccess;
  }

  @Get()
  @ApiOperation({ summary: 'List adopted compliance frameworks' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Alias for pageSize' })
  @ApiOkResponse({ description: 'Adopted frameworks with derived summaries' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  list(@Req() req: AuthenticatedRequest, @Query() dto: ListComplianceFrameworksDto) {
    return this.complianceService.listFrameworks(this.access(req), dto);
  }

  @Post()
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Adopt a framework version' })
  @ApiBody({ type: AdoptFrameworkDto })
  @ApiOkResponse({ description: 'Framework adopted and requirements instantiated' })
  @ApiForbiddenResponse({ description: 'Requires OWNER, GRC_ADMIN, or COMPLIANCE_MANAGER role' })
  @ApiConflictResponse({ description: 'Framework is already adopted' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: AdoptFrameworkDto) {
    return this.complianceService.adoptFramework(this.access(req), dto);
  }

  @Get(':organizationFrameworkId')
  @ApiOperation({ summary: 'Get an adopted framework and compliance summary' })
  @ApiParam({ name: 'organizationFrameworkId', format: 'uuid' })
  @ApiOkResponse({ description: 'Framework detail' })
  get(@Req() req: AuthenticatedRequest, @Param('organizationFrameworkId', new ParseUUIDPipe()) id: string) {
    return this.complianceService.getFramework(this.access(req), id);
  }

  @Post(':organizationFrameworkId/archive')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Archive an adopted framework' })
  @ApiParam({ name: 'organizationFrameworkId', format: 'uuid' })
  @ApiOkResponse({ description: 'Framework archived' })
  @ApiForbiddenResponse({ description: 'Requires Compliance management role' })
  archive(@Req() req: AuthenticatedRequest, @Param('organizationFrameworkId', new ParseUUIDPipe()) id: string) {
    return this.complianceService.archiveFramework(this.access(req), id);
  }
}
