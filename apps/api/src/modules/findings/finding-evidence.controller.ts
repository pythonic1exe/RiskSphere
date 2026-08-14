import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { LinkFindingEvidenceDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingEvidenceService } from './finding-evidence.service';

@ApiTags('Finding Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/findings/:findingId/evidence')
export class FindingEvidenceController {
  constructor(private readonly evidence: FindingEvidenceService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }

  @Get() list(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) { return this.evidence.list(this.access(req), findingId); }
  @Post() @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiOperation({ summary: 'Link an exact EvidenceVersion to a Finding' }) @ApiBody({ type: LinkFindingEvidenceDto }) link(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: LinkFindingEvidenceDto) { return this.evidence.link(this.access(req), findingId, dto); }
  @Delete(':findingEvidenceId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) unlink(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Param('findingEvidenceId', new ParseUUIDPipe()) findingEvidenceId: string) { return this.evidence.unlink(this.access(req), findingId, findingEvidenceId); }
}
