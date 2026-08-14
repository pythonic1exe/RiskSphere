import { ApiPropertyOptional } from '@nestjs/swagger';
import { EvidenceStatus, EvidenceType } from '@prisma/client';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListEvidenceDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional({ enum: EvidenceStatus }) @IsOptional() @IsEnum(EvidenceStatus) status?: EvidenceStatus;
  @ApiPropertyOptional({ enum: EvidenceType }) @IsOptional() @IsEnum(EvidenceType) type?: EvidenceType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() controlId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() createdByMembershipId?: string;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) @IsOptional() @IsDateString() expiresBefore?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: ['title', 'updatedAt', 'status', 'expiresAt'] }) @IsOptional() @IsIn(['title', 'updatedAt', 'status', 'expiresAt']) sortBy?: 'title' | 'updatedAt' | 'status' | 'expiresAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
