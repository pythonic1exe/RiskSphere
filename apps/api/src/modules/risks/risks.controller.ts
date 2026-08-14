import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
import { RisksService } from './risks.service';
import { CreateRiskAssessmentDto, CreateRiskDto, ListRisksDto, ReviewRiskDto, UpdateRiskDto, UpdateRiskTreatmentDto } from './dto';

@ApiTags('Risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  private access(request: AuthenticatedRequest) {
    if (!request.organizationAccess) throw new InternalServerErrorException('Organization access missing');
    return request.organizationAccess;
  }

  @ApiOperation({ summary: 'List organization risks' })
  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() dto: ListRisksDto) { return this.risksService.list(this.access(req), dto); }

  @ApiOperation({ summary: 'Get organization-wide risk posture summary' })
  @Get('summary')
  summary(@Req() req: AuthenticatedRequest) { return this.risksService.summary(this.access(req)); }

  @ApiOperation({ summary: 'Create a risk' }) @ApiBody({ type: CreateRiskDto })
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateRiskDto) { return this.risksService.create(this.access(req), dto); }

  @ApiParam({ name: 'riskId', format: 'uuid' })
  @Get(':riskId')
  findOne(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.risksService.findOne(this.access(req), riskId); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @ApiBody({ type: UpdateRiskDto })
  @Patch(':riskId')
  update(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string, @Body() dto: UpdateRiskDto) { return this.risksService.update(this.access(req), riskId, dto); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @ApiBody({ type: CreateRiskAssessmentDto })
  @Post(':riskId/assessments')
  assess(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string, @Body() dto: CreateRiskAssessmentDto) { return this.risksService.addAssessment(this.access(req), riskId, dto); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @ApiBody({ type: UpdateRiskTreatmentDto })
  @Put(':riskId/treatment')
  treatment(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string, @Body() dto: UpdateRiskTreatmentDto) { return this.risksService.upsertTreatment(this.access(req), riskId, dto); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @ApiBody({ type: ReviewRiskDto })
  @Post(':riskId/review')
  review(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string, @Body() dto: ReviewRiskDto) { return this.risksService.review(this.access(req), riskId, dto); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @Post(':riskId/close')
  close(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.risksService.close(this.access(req), riskId); }

  @ApiParam({ name: 'riskId', format: 'uuid' }) @Post(':riskId/archive')
  archive(@Req() req: AuthenticatedRequest, @Param('riskId', new ParseUUIDPipe()) riskId: string) { return this.risksService.archive(this.access(req), riskId); }
}
