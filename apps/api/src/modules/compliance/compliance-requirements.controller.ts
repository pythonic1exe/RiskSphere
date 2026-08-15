import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ComplianceService } from './compliance.service';
// DTO classes are runtime values for Nest ValidationPipe and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateRequirementAssessmentDto, ListRequirementsDto, UpdateOrganizationRequirementDto } from './dto';

@ApiTags('Compliance Requirements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/compliance')
export class ComplianceRequirementsController {
  constructor(private readonly complianceService: ComplianceService) {}

  private access(request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return request.organizationAccess;
  }

  @Get('frameworks/:organizationFrameworkId/requirements')
  @ApiOperation({ summary: 'List organization requirements for an adopted framework' })
  @ApiParam({ name: 'organizationFrameworkId', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Alias for pageSize' })
  @ApiOkResponse({ description: 'Paginated organization requirements' })
  list(@Req() req: AuthenticatedRequest, @Param('organizationFrameworkId', new ParseUUIDPipe()) frameworkId: string, @Query() dto: ListRequirementsDto) {
    return this.complianceService.listRequirements(this.access(req), frameworkId, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get organization-wide compliance summary' })
  summary(@Req() req: AuthenticatedRequest) {
    return this.complianceService.summary(this.access(req));
  }

  @Get('requirements/:requirementId')
  @ApiOperation({ summary: 'Get an organization requirement' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  @ApiOkResponse({ description: 'Requirement detail with assessment history and linked controls' })
  get(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) id: string) {
    return this.complianceService.getRequirement(this.access(req), id);
  }

  @Patch('requirements/:requirementId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Update organization-managed requirement metadata' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  @ApiBody({ type: UpdateOrganizationRequirementDto })
  @ApiForbiddenResponse({ description: 'Requires Compliance management role' })
  update(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) id: string, @Body() dto: UpdateOrganizationRequirementDto) {
    return this.complianceService.updateRequirement(this.access(req), id, dto);
  }

  @Post('requirements/:requirementId/assessments')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Record an immutable requirement assessment' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  @ApiBody({ type: CreateRequirementAssessmentDto })
  @ApiConflictResponse({ description: 'Archived frameworks cannot be assessed' })
  assess(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) id: string, @Body() dto: CreateRequirementAssessmentDto) {
    return this.complianceService.createAssessment(this.access(req), id, dto);
  }

  @Get('requirements/:requirementId/assessments')
  @ApiOperation({ summary: 'List requirement assessment history' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  listAssessments(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) id: string) {
    return this.complianceService.listAssessments(this.access(req), id);
  }

  @Get('requirements/:requirementId/controls')
  @ApiOperation({ summary: 'List controls linked to a requirement' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  listControls(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) id: string) {
    return this.complianceService.listRequirementControls(this.access(req), id);
  }

  @Post('requirements/:requirementId/controls/:controlId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Link a control to a requirement' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  @ApiParam({ name: 'controlId', format: 'uuid' })
  @ApiConflictResponse({ description: 'Control is already linked or cannot be linked' })
  linkControl(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) requirementId: string, @Param('controlId', new ParseUUIDPipe()) controlId: string) {
    return this.complianceService.linkControl(this.access(req), requirementId, controlId);
  }

  @Delete('requirements/:requirementId/controls/:controlId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Unlink a control from a requirement' })
  @ApiParam({ name: 'requirementId', format: 'uuid' })
  @ApiParam({ name: 'controlId', format: 'uuid' })
  unlinkControl(@Req() req: AuthenticatedRequest, @Param('requirementId', new ParseUUIDPipe()) requirementId: string, @Param('controlId', new ParseUUIDPipe()) controlId: string) {
    return this.complianceService.unlinkControl(this.access(req), requirementId, controlId);
  }

  @Get('controls/:controlId/requirements')
  @ApiOperation({ summary: 'List compliance requirements linked to a control' })
  @ApiParam({ name: 'controlId', format: 'uuid' })
  listControlRequirements(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string) {
    return this.complianceService.listControlRequirements(this.access(req), controlId);
  }
}
