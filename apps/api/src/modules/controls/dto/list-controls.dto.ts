import { ApiPropertyOptional } from '@nestjs/swagger';
import { ControlAutomationType, ControlFrequency, ControlStatus, ControlType } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListControlsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: ControlStatus }) @IsOptional() @IsEnum(ControlStatus) status?: ControlStatus;
  @ApiPropertyOptional({ enum: ControlType }) @IsOptional() @IsEnum(ControlType) type?: ControlType;
  @ApiPropertyOptional({ enum: ControlAutomationType }) @IsOptional() @IsEnum(ControlAutomationType) automationType?: ControlAutomationType;
  @ApiPropertyOptional({ enum: ControlFrequency }) @IsOptional() @IsEnum(ControlFrequency) frequency?: ControlFrequency;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() riskId?: string;
  @ApiPropertyOptional({ enum: ['code', 'title', 'updatedAt', 'status'] }) @IsOptional() @IsIn(['code', 'title', 'updatedAt', 'status']) sortBy?: 'code' | 'title' | 'updatedAt' | 'status';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
