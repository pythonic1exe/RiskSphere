import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard, OrganizationRoles } from '../../common/authorization';
import { ORGANIZATION_ROLE_CODES } from '../../common/auth/auth.constants';
// These DTOs must remain runtime imports for Nest ValidationPipe metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateEvidenceDto, CreateEvidenceVersionDto, ListEvidenceDto, UpdateEvidenceDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { EvidenceService } from './evidence.service';
import type { UploadedEvidenceFile } from './evidence.service';

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  private access(request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return request.organizationAccess;
  }

  @Get('evidence')
  @ApiOperation({ summary: 'List organization evidence' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Alias for pageSize' })
  @ApiOkResponse({ description: 'Paginated evidence records' })
  list(@Req() req: AuthenticatedRequest, @Query() dto: ListEvidenceDto) { return this.evidenceService.list(this.access(req), dto); }

  @Post('evidence')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Create an evidence record' })
  @ApiBody({ type: CreateEvidenceDto })
  @ApiForbiddenResponse({ description: 'Requires an Evidence management role' })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateEvidenceDto) { return this.evidenceService.create(this.access(req), dto); }

  @Get('evidence/:evidenceId')
  @ApiOperation({ summary: 'Get evidence detail' })
  @ApiParam({ name: 'evidenceId', format: 'uuid' })
  @ApiOkResponse({ description: 'Evidence detail with versions and links' })
  findOne(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string) { return this.evidenceService.findOne(this.access(req), evidenceId); }

  @Patch('evidence/:evidenceId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Update evidence metadata' })
  @ApiParam({ name: 'evidenceId', format: 'uuid' })
  @ApiBody({ type: UpdateEvidenceDto })
  update(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Body() dto: UpdateEvidenceDto) { return this.evidenceService.update(this.access(req), evidenceId, dto); }

  @Post('evidence/:evidenceId/versions')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add an immutable evidence version' })
  @ApiParam({ name: 'evidenceId', format: 'uuid' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, externalUrl: { type: 'string', format: 'uri' }, textContent: { type: 'string' }, fileName: { type: 'string' }, mimeType: { type: 'string' } } } })
  @ApiConflictResponse({ description: 'Archived evidence cannot receive a new version' })
  addVersion(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Body() dto: CreateEvidenceVersionDto, @UploadedFile() file?: UploadedEvidenceFile) { return this.evidenceService.addVersion(this.access(req), evidenceId, dto, file); }

  @Get('evidence/:evidenceId/versions')
  @ApiOperation({ summary: 'List immutable evidence versions' })
  @ApiParam({ name: 'evidenceId', format: 'uuid' })
  listVersions(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string) { return this.evidenceService.listVersions(this.access(req), evidenceId); }

  @Post('evidence/:evidenceId/archive')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  @ApiOperation({ summary: 'Archive evidence' })
  @ApiParam({ name: 'evidenceId', format: 'uuid' })
  archive(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string) { return this.evidenceService.archive(this.access(req), evidenceId); }

  @Post('evidence/:evidenceId/controls/:controlId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  linkControl(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.evidenceService.linkControl(this.access(req), evidenceId, controlId); }

  @Delete('evidence/:evidenceId/controls/:controlId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  unlinkControl(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.evidenceService.unlinkControl(this.access(req), evidenceId, controlId); }

  @Get('evidence/:evidenceId/controls')
  listControlsForEvidence(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string) { return this.evidenceService.listControlsForEvidence(this.access(req), evidenceId); }

  @Get('controls/:controlId/evidence')
  listEvidenceForControl(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.evidenceService.listEvidenceForControl(this.access(req), controlId); }

  @Post('evidence/:evidenceId/executions/:executionId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  linkExecution(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.evidenceService.linkExecution(this.access(req), evidenceId, executionId); }

  @Delete('evidence/:evidenceId/executions/:executionId')
  @OrganizationRoles(ORGANIZATION_ROLE_CODES.OWNER, ORGANIZATION_ROLE_CODES.GRC_ADMIN, ORGANIZATION_ROLE_CODES.COMPLIANCE_MANAGER)
  unlinkExecution(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.evidenceService.unlinkExecution(this.access(req), evidenceId, executionId); }

  @Get('evidence/:evidenceId/executions')
  listExecutionsForEvidence(@Req() req: AuthenticatedRequest, @Param('evidenceId', new ParseUUIDPipe()) evidenceId: string) { return this.evidenceService.listExecutionsForEvidence(this.access(req), evidenceId); }

  @Get('executions/:executionId/evidence')
  listEvidenceForExecution(@Req() req: AuthenticatedRequest, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.evidenceService.listEvidenceForExecution(this.access(req), executionId); }
}
