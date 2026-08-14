import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// DTOs remain runtime imports for Nest validation and Swagger metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AssignOrganizationUnitMemberDto, ListOrganizationUnitsDto, OrganizationUnitDto, UpdateOrganizationUnitDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { OrganizationUnitsService } from './organization-units.service';

@ApiTags('Organization Units') @ApiBearerAuth() @UseGuards(JwtAuthGuard, OrganizationRoleGuard) @Controller('organizations/:organizationId/units')
export class OrganizationUnitsController {
  constructor(private readonly units: OrganizationUnitsService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }
  @ApiOperation({ summary: 'List organization units' }) @Get() list(@Req() req: AuthenticatedRequest, @Query() dto: ListOrganizationUnitsDto) { return this.units.list(this.access(req), dto); }
  @ApiOperation({ summary: 'Create an organization unit' }) @ApiBody({ type: OrganizationUnitDto }) @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: OrganizationUnitDto) { return this.units.create(this.access(req), dto); }
  @ApiOperation({ summary: 'Get an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @Get(':unitId') findOne(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) id: string) { return this.units.findOne(this.access(req), id); }
  @ApiOperation({ summary: 'Update an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @ApiBody({ type: UpdateOrganizationUnitDto }) @Patch(':unitId') update(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) id: string, @Body() dto: UpdateOrganizationUnitDto) { return this.units.update(this.access(req), id, dto); }
  @ApiOperation({ summary: 'Deactivate an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @Delete(':unitId') deactivate(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) id: string) { return this.units.deactivate(this.access(req), id); }
  @ApiOperation({ summary: 'List members assigned to an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @Get(':unitId/members') members(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) id: string) { return this.units.members(this.access(req), id); }
  @ApiOperation({ summary: 'Assign a member to an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @ApiBody({ type: AssignOrganizationUnitMemberDto }) @Post(':unitId/members') addMember(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) id: string, @Body() dto: AssignOrganizationUnitMemberDto) { return this.units.addMember(this.access(req), id, dto); }
  @ApiOperation({ summary: 'Remove a member from an organization unit' }) @ApiParam({ name: 'unitId', format: 'uuid' }) @ApiParam({ name: 'membershipId', format: 'uuid' }) @Delete(':unitId/members/:membershipId') removeMember(@Req() req: AuthenticatedRequest, @Param('unitId', new ParseUUIDPipe()) unitId: string, @Param('membershipId', new ParseUUIDPipe()) membershipId: string) { return this.units.removeMember(this.access(req), unitId, membershipId); }
}
