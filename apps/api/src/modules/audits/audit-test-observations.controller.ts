import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { CreateAuditTestObservationDto, UpdateAuditTestObservationDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditTestObservationsService } from './audit-test-observations.service';

@ApiTags('Audit Test Observations') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/audit-tests/:auditTestId/observations')
export class AuditTestObservationsController {
  constructor(private readonly observations: AuditTestObservationsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @Get() @ApiOperation({ summary: 'List Audit Test observations' }) list(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.observations.list(this.access(req), id); }
  @Post() @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: CreateAuditTestObservationDto }) create(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string, @Body() dto: CreateAuditTestObservationDto) { return this.observations.create(this.access(req), id, dto); }
  @Patch(':observationId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: UpdateAuditTestObservationDto }) update(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) auditTestId: string, @Param('observationId', new ParseUUIDPipe()) observationId: string, @Body() dto: UpdateAuditTestObservationDto) { return this.observations.update(this.access(req), auditTestId, observationId, dto); }
  @Delete(':observationId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) remove(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) auditTestId: string, @Param('observationId', new ParseUUIDPipe()) observationId: string) { return this.observations.remove(this.access(req), auditTestId, observationId); }
}
