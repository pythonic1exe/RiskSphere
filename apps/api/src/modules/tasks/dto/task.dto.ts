import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskSourceType, TaskStatus } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: TaskPriority }) @IsEnum(TaskPriority) priority!: TaskPriority;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() assigneeMembershipId?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}

export class CreateFindingTaskDto extends CreateTaskDto {}

export class UpdateTaskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() description?: string | null;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() assigneeMembershipId?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}

export class BlockTaskDto {
  @ApiProperty() @IsString() @MinLength(1) reason!: string;
}

export class CompleteTaskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() completionNotes?: string;
}

export class CancelTaskDto {
  @ApiProperty() @IsString() @MinLength(1) reason!: string;
}

export class ReopenTaskDto {
  @ApiProperty() @IsString() @MinLength(1) reason!: string;
}

export class TaskQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: TaskStatus }) @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assigneeMembershipId?: string;
  @ApiPropertyOptional({ enum: TaskSourceType }) @IsOptional() @IsEnum(TaskSourceType) sourceType?: TaskSourceType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() findingId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() overdue?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() assignedToMe?: boolean;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) @IsOptional() @IsDateString() dueBefore?: string;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) @IsOptional() @IsDateString() dueAfter?: string;
  @ApiPropertyOptional({ enum: ['taskNumber', 'title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt'] }) @IsOptional() @IsIn(['taskNumber', 'title', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt']) sortBy?: 'taskNumber' | 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
