import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRequirementStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListRequirementsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: OrganizationRequirementStatus }) @IsOptional() @IsEnum(OrganizationRequirementStatus) status?: OrganizationRequirementStatus;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() domain?: string;
  @ApiPropertyOptional({ enum: ['true', 'false'] }) @IsOptional() @Transform(({ value }) => String(value)) @IsIn(['true', 'false']) hasControls?: 'true' | 'false';
  @ApiPropertyOptional({ enum: ['code', 'title', 'domain', 'status', 'updatedAt'] }) @IsOptional() @IsIn(['code', 'title', 'domain', 'status', 'updatedAt']) sortBy?: 'code' | 'title' | 'domain' | 'status' | 'updatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
