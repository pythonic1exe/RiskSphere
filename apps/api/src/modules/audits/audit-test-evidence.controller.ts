import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { LinkAuditTestEvidenceDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditTestEvidenceService } from './audit-test-evidence.service';

@ApiTags('Audit Test Evidence') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/audit-tests/:auditTestId/evidence')
export class AuditTestEvidenceController {
  constructor(private readonly evidence: AuditTestEvidenceService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @Get() @ApiOperation({ summary: 'List exact EvidenceVersions linked to an Audit Test' }) list(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string) { return this.evidence.list(this.access(req), id); }
  @Post() @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: LinkAuditTestEvidenceDto }) @ApiConflictResponse() link(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) id: string, @Body() dto: LinkAuditTestEvidenceDto) { return this.evidence.link(this.access(req), id, dto); }
  @Delete(':linkId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) unlink(@Req() req: AuthenticatedRequest, @Param('auditTestId', new ParseUUIDPipe()) auditTestId: string, @Param('linkId', new ParseUUIDPipe()) linkId: string) { return this.evidence.unlink(this.access(req), auditTestId, linkId); }
}
