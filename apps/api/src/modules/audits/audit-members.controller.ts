import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { CreateAuditMemberDto, UpdateAuditMemberDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AuditMembersService } from './audit-members.service';

@ApiTags('Audit Members') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/audits/:auditId/members')
export class AuditMembersController {
  constructor(private readonly members: AuditMembersService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @Get() @ApiOperation({ summary: 'List Audit members' }) list(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) auditId: string) { return this.members.list(this.access(req), auditId); }
  @Post() @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: CreateAuditMemberDto }) add(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) auditId: string, @Body() dto: CreateAuditMemberDto) { return this.members.add(this.access(req), auditId, dto); }
  @Patch(':memberId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) @ApiBody({ type: UpdateAuditMemberDto }) update(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) auditId: string, @Param('memberId', new ParseUUIDPipe()) memberId: string, @Body() dto: UpdateAuditMemberDto) { return this.members.update(this.access(req), auditId, memberId, dto); }
  @Delete(':memberId') @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER) remove(@Req() req: AuthenticatedRequest, @Param('auditId', new ParseUUIDPipe()) auditId: string, @Param('memberId', new ParseUUIDPipe()) memberId: string) { return this.members.remove(this.access(req), auditId, memberId); }
}
