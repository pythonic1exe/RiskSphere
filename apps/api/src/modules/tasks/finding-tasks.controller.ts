import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// DTOs must remain runtime imports so Nest's ValidationPipe and Swagger receive metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CreateFindingTaskDto, TaskQueryDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TasksService } from './tasks.service';

@ApiTags('Finding Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/findings/:findingId/tasks')
export class FindingTasksController {
  constructor(private readonly tasks: TasksService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }

  @Get() list(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Query() dto: TaskQueryDto) { return this.tasks.findingTasks(this.access(req), findingId, dto); }
  @Post() @ApiParam({ name: 'findingId', format: 'uuid' }) @ApiBody({ type: CreateFindingTaskDto }) create(@Req() req: AuthenticatedRequest, @Param('findingId', new ParseUUIDPipe()) findingId: string, @Body() dto: CreateFindingTaskDto) { return this.tasks.createForFinding(this.access(req), findingId, dto); }
}
