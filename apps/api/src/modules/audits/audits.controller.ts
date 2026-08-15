import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuditStatus } from '@prisma/client';

import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
// DTOs are runtime imports for Nest validation and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateAuditDto, ListAuditsDto, UpdateAuditDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditsService } from './audits.service';

@ApiTags('Audits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId')
export class AuditsController {
  constructor(private readonly audits: AuditsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }

  @Get('audits') @ApiOperation({ summary: 'List organization Audits' }) @ApiOkResponse({ description: 'Paginated Audits' }) list(@Req() req: AuthenticatedRequest, @Query() dto: ListAuditsDto) { return this.audits.list(this.access(req), dto); }
  @Get('audits/summary') @ApiOperation({ summary: 'Get organization-wide audit summary' }) summary(@Req() req: AuthenticatedRequest) { return this.audits.summary(this.access(req)); }
  @Post('audits') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Create an Audit' }) @ApiBody({ type: CreateAuditDto }) @ApiForbiddenResponse() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateAuditDto) { return this.audits.create(this.access(req), dto); }
  @Get('audits/:auditId') @ApiOperation({ summary: 'Get Audit detail' }) @ApiParam({ name: 'auditId', format: 'uuid' }) findOne(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.findOne(this.access(req), id); }
  @Patch('audits/:auditId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Update Audit metadata' }) @ApiBody({ type: UpdateAuditDto }) update(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAuditDto) { return this.audits.update(this.access(req), id, dto); }
  @Post('audits/:auditId/plan') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Plan an Audit' }) plan(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.transition(this.access(req), id, AuditStatus.PLANNED); }
  @Post('audits/:auditId/start') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Start an Audit' }) start(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.transition(this.access(req), id, AuditStatus.IN_PROGRESS); }
  @Post('audits/:auditId/submit-for-review') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Submit an Audit for review' }) submitForReview(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.transition(this.access(req), id, AuditStatus.UNDER_REVIEW); }
  @Post('audits/:auditId/complete') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Complete an Audit' }) @ApiConflictResponse() complete(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.transition(this.access(req), id, AuditStatus.COMPLETED); }
  @Post('audits/:auditId/cancel') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Cancel an Audit' }) cancel(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string) { return this.audits.transition(this.access(req), id, AuditStatus.CANCELLED); }
}
