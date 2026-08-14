import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import {
  CloseFindingExceptionallyDto,
  CreateFindingDto,
  ReopenFindingDto,
  UpdateFindingDto,
} from './dto';
// ListFindingsDto must remain a runtime import so Nest's ValidationPipe receives its metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ListFindingsDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FindingsService } from './findings.service';

@ApiTags('Findings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/findings')
export class FindingsController {
  constructor(private readonly findings: FindingsService) {}

  private access(req: AuthenticatedRequest) {
    if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return req.organizationAccess;
  }

  @Get()
  @ApiOperation({ summary: 'List organization Findings' })
  list(@Req() req: AuthenticatedRequest, @Query() dto: ListFindingsDto) { return this.findings.list(this.access(req), dto); }

  @Get('summary')
  @ApiOperation({ summary: 'Get Finding summary' })
  summary(@Req() req: AuthenticatedRequest) { return this.findings.summary(this.access(req)); }

  @Post()
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Create a manual Finding' })
  @ApiBody({ type: CreateFindingDto })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateFindingDto) { return this.findings.create(this.access(req), dto); }

  @Get(':findingId')
  @ApiParam({ name: 'findingId', format: 'uuid' })
  findOne(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) { return this.findings.findOne(this.access(req), findingId); }

  @Patch(':findingId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiParam({ name: 'findingId', format: 'uuid' })
  @ApiBody({ type: UpdateFindingDto })
  update(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: UpdateFindingDto) { return this.findings.update(this.access(req), findingId, dto); }

  @Post(':findingId/start-remediation')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  startRemediation(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) { return this.findings.startRemediation(this.access(req), findingId); }

  @Post(':findingId/submit-for-validation')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  submitForValidation(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string) { return this.findings.submitForValidation(this.access(req), findingId); }

  @Post(':findingId/reopen')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiBody({ type: ReopenFindingDto })
  reopen(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: ReopenFindingDto) { return this.findings.reopen(this.access(req), findingId, dto); }

  @Post(':findingId/close-exceptionally')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiBody({ type: CloseFindingExceptionallyDto })
  @ApiConflictResponse()
  closeExceptionally(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: CloseFindingExceptionallyDto) { return this.findings.closeExceptionally(this.access(req), findingId, dto); }
}
