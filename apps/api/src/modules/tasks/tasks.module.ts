import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../../common/authorization/authorization.module';
import { PrismaModule } from '../../database/prisma.module';
import { FindingTasksController } from './finding-tasks.controller';
import { TaskActivityService } from './task-activity.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule, AuthModule, AuthorizationModule],
  controllers: [TasksController, FindingTasksController],
  providers: [TasksService, TaskActivityService],
  exports: [TasksService],
})
export class TasksModule {}
