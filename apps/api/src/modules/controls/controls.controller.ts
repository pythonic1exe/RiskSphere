import { Body, Controller, Delete, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ControlsService } from './controls.service';
// ListControlsDto must remain a runtime import so Nest's ValidationPipe receives its metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CompleteControlExecutionDto, CreateControlDto, CreateControlExecutionDto, ListControlsDto, UpdateControlDto, UpdateControlExecutionDto } from './dto';

@ApiTags('Controls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  private access(request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return request.organizationAccess;
  }

  @ApiOperation({ summary: 'List organization controls' })
  @ApiQuery({ name: 'limit', required: false, description: 'Alias for pageSize' })
  @Get('controls')
  list(@Req() req: AuthenticatedRequest, @Query() dto: ListControlsDto) { return this.controlsService.list(this.access(req), dto); }

  @ApiOperation({ summary: 'Create a control' }) @ApiBody({ type: CreateControlDto })
  @Post('controls')
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateControlDto) { return this.controlsService.create(this.access(req), dto); }

  @ApiParam({ name: 'controlId', format: 'uuid' })
  @Get('controls/:controlId')
  findOne(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.controlsService.findOne(this.access(req), controlId); }

  @ApiParam({ name: 'controlId', format: 'uuid' }) @ApiBody({ type: UpdateControlDto })
  @Patch('controls/:controlId')
  update(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Body() dto: UpdateControlDto) { return this.controlsService.update(this.access(req), controlId, dto); }

  @Post('controls/:controlId/activate') activate(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) id: string) { return this.controlsService.activate(this.access(req), id); }
  @Post('controls/:controlId/retire') retire(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) id: string) { return this.controlsService.retire(this.access(req), id); }
  @Post('controls/:controlId/archive') archive(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) id: string) { return this.controlsService.archive(this.access(req), id); }

  @Get('controls/:controlId/executions')
  listExecutions(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.controlsService.listExecutions(this.access(req), controlId); }

  @ApiBody({ type: CreateControlExecutionDto })
  @Post('controls/:controlId/executions')
  createExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Body() dto: CreateControlExecutionDto) { return this.controlsService.createExecution(this.access(req), controlId, dto); }

  @Get('controls/:controlId/executions/:executionId')
  getExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.controlsService.getExecution(this.access(req), controlId, executionId); }

  @ApiBody({ type: UpdateControlExecutionDto })
  @Patch('controls/:controlId/executions/:executionId')
  updateExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string, @Body() dto: UpdateControlExecutionDto) { return this.controlsService.updateExecution(this.access(req), controlId, executionId, dto); }

  @Post('controls/:controlId/executions/:executionId/start')
  startExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.controlsService.startExecution(this.access(req), controlId, executionId); }

  @ApiBody({ type: CompleteControlExecutionDto })
  @Post('controls/:controlId/executions/:executionId/complete')
  completeExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string, @Body() dto: CompleteControlExecutionDto) { return this.controlsService.completeExecution(this.access(req), controlId, executionId, dto); }

  @Post('controls/:controlId/executions/:executionId/cancel')
  cancelExecution(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('executionId', new ParseUUIDPipe()) executionId: string) { return this.controlsService.cancelExecution(this.access(req), controlId, executionId); }

  @Get('controls/:controlId/risks')
  listRisks(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string) { return this.controlsService.listRisks(this.access(req), controlId); }

  @Post('controls/:controlId/risks/:riskId')
  linkRisk(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.controlsService.linkRisk(this.access(req), controlId, riskId); }

  @Delete('controls/:controlId/risks/:riskId')
  unlinkRisk(@Req() req: AuthenticatedRequest, @Param('controlId', new ParseUUIDPipe()) controlId: string, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.controlsService.unlinkRisk(this.access(req), controlId, riskId); }

  @Get('risks/:riskId/controls')
  listControlsForRisk(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.controlsService.listControlsForRisk(this.access(req), riskId); }
}
