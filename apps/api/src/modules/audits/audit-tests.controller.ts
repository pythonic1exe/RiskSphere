import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditTestStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
// DTOs are runtime imports for Nest validation and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CompleteAuditTestDto, CreateAuditTestDto, ListAuditTestsDto, UpdateAuditTestDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditTestsService } from './audit-tests.service';

@ApiTags('Audit Tests') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId')
export class AuditTestsController {
  constructor(private readonly tests: AuditTestsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @Get('audits/:auditId/tests') @ApiOperation({ summary: 'List Audit Tests' }) list(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string, @Query() dto: ListAuditTestsDto) { return this.tests.list(this.access(req), id, dto); }
  @Post('audits/:auditId/tests') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: CreateAuditTestDto }) add(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) id: string, @Body() dto: CreateAuditTestDto) { return this.tests.create(this.access(req), id, dto); }
  @Get('audit-tests/:auditTestId') @ApiOperation({ summary: 'Get Audit Test detail' }) findOne(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.tests.findOne(this.access(req), id); }
  @Patch('audit-tests/:auditTestId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: UpdateAuditTestDto }) update(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAuditTestDto) { return this.tests.update(this.access(req), id, dto); }
  @Post('audit-tests/:auditTestId/start') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) start(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.tests.transition(this.access(req), id, AuditTestStatus.IN_PROGRESS); }
  @Post('audit-tests/:auditTestId/submit-for-review') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) submit(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.tests.transition(this.access(req), id, AuditTestStatus.READY_FOR_REVIEW); }
  @Post('audit-tests/:auditTestId/complete') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiConflictResponse() complete(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string, @Body() dto: CompleteAuditTestDto) { return this.tests.transition(this.access(req), id, AuditTestStatus.COMPLETED, dto); }
  @Post('audit-tests/:auditTestId/block') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) block(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.tests.transition(this.access(req), id, AuditTestStatus.BLOCKED); }
  @Post('audit-tests/:auditTestId/unblock') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) unblock(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.tests.transition(this.access(req), id, AuditTestStatus.IN_PROGRESS); }
}
