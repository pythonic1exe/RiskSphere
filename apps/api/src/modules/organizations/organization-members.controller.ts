import { Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Query, Req, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// Nest uses runtime tokens for controller dependency injection and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationMembersService } from './organization-members.service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ListOrganizationMembersDto, UpdateOrganizationMemberDto } from './dto';

@ApiTags('Organization Members') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/members')
export class OrganizationMembersController {
  constructor(private readonly members: OrganizationMembersService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @ApiOperation({ summary: 'List organization members' }) @Get() list(@Req() req: AuthenticatedRequest, @Query() dto: ListOrganizationMembersDto) { return this.members.list(this.access(req), dto); }
  @ApiOperation({ summary: 'Get an organization member' }) @ApiParam({ name: 'membershipId', format: 'uuid' }) @Get(':membershipId') findOne(@Req() req: AuthenticatedRequest, @Param('membershipId', new ParseUUIDPipe()) id: string) { return this.members.findOne(this.access(req), id); }
  @ApiOperation({ summary: 'Update membership status and roles' }) @ApiParam({ name: 'membershipId', format: 'uuid' }) @ApiBody({ type: UpdateOrganizationMemberDto }) @Patch(':membershipId') update(@Req() req: AuthenticatedRequest, @Param('membershipId', new ParseUUIDPipe()) id: string, @Body() dto: UpdateOrganizationMemberDto) { return this.members.update(this.access(req), id, dto); }
  @ApiOperation({ summary: 'Remove organization access without deleting the user' }) @ApiParam({ name: 'membershipId', format: 'uuid' }) @Delete(':membershipId') remove(@Req() req: AuthenticatedRequest, @Param('membershipId', new ParseUUIDPipe()) id: string) { return this.members.remove(this.access(req), id); }
}
