import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationFrameworkStatus } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListComplianceFrameworksDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional({ enum: OrganizationFrameworkStatus }) @IsOptional() @IsEnum(OrganizationFrameworkStatus) status?: OrganizationFrameworkStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional({ enum: ['code', 'name', 'version', 'updatedAt', 'status'] }) @IsOptional() @IsIn(['code', 'name', 'version', 'updatedAt', 'status']) sortBy?: 'code' | 'name' | 'version' | 'updatedAt' | 'status';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
