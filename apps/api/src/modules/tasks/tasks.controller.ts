import { Body, Controller, Get, InternalServerErrorException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../common/auth';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { OrganizationRoleGuard } from '../../common/authorization';
// DTOs must remain runtime imports so Nest's ValidationPipe and Swagger receive metadata.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { BlockTaskDto, CancelTaskDto, CompleteTaskDto, CreateTaskDto, ReopenTaskDto, TaskQueryDto, UpdateTaskDto } from './dto';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TaskActivityService } from './task-activity.service';
// Nest uses the runtime constructor token for dependency injection.
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@Controller('organizations/:organizationId/tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService, private readonly activities: TaskActivityService) {}
  private access(req: AuthenticatedRequest) { if (!req.organizationAccess) throw new InternalServerErrorException('Organization access missing'); return req.organizationAccess; }

  @Get() list(@Req() req: AuthenticatedRequest, @Query() dto: TaskQueryDto) { return this.tasks.list(this.access(req), dto); }
  @Get('summary') summary(@Req() req: AuthenticatedRequest) { return this.tasks.summary(this.access(req)); }
  @Post() @ApiBody({ type: CreateTaskDto }) create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTaskDto) { return this.tasks.create(this.access(req), dto); }
  @Get(':taskId') @ApiParam({ name: 'taskId', format: 'uuid' }) findOne(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string) { return this.tasks.findOne(this.access(req), taskId); }
  @Patch(':taskId') @ApiParam({ name: 'taskId', format: 'uuid' }) @ApiBody({ type: UpdateTaskDto }) update(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string, @Body() dto: UpdateTaskDto) { return this.tasks.update(this.access(req), taskId, dto); }
  @Get(':taskId/activity') @ApiParam({ name: 'taskId', format: 'uuid' }) activity(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string) { return this.activities.list(this.access(req), taskId); }
  @Post(':taskId/start') @ApiParam({ name: 'taskId', format: 'uuid' }) start(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string) { return this.tasks.start(this.access(req), taskId); }
  @Post(':taskId/block') @ApiParam({ name: 'taskId', format: 'uuid' }) @ApiBody({ type: BlockTaskDto }) block(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string, @Body() dto: BlockTaskDto) { return this.tasks.block(this.access(req), taskId, dto); }
  @Post(':taskId/unblock') @ApiParam({ name: 'taskId', format: 'uuid' }) unblock(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string) { return this.tasks.unblock(this.access(req), taskId); }
  @Post(':taskId/complete') @ApiParam({ name: 'taskId', format: 'uuid' }) @ApiBody({ type: CompleteTaskDto }) complete(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string, @Body() dto: CompleteTaskDto) { return this.tasks.complete(this.access(req), taskId, dto); }
  @Post(':taskId/reopen') @ApiParam({ name: 'taskId', format: 'uuid' }) @ApiBody({ type: ReopenTaskDto }) reopen(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string, @Body() dto: ReopenTaskDto) { return this.tasks.reopen(this.access(req), taskId, dto); }
  @Post(':taskId/cancel') @ApiParam({ name: 'taskId', format: 'uuid' }) @ApiBody({ type: CancelTaskDto }) cancel(@Req() req: AuthenticatedRequest, @Param('taskId', new ParseUUIDPipe()) taskId: string, @Body() dto: CancelTaskDto) { return this.tasks.cancel(this.access(req), taskId, dto); }
}
