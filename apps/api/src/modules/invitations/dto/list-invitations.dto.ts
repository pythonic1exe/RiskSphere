import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListInvitationsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: InvitationStatus }) @IsOptional() @IsEnum(InvitationStatus) status?: InvitationStatus;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roleId?: string;
  @ApiPropertyOptional({ enum: ['invitedEmail', 'status', 'createdAt', 'expiresAt'] }) @IsOptional() @IsIn(['invitedEmail', 'status', 'createdAt', 'expiresAt']) sortBy?: 'invitedEmail' | 'status' | 'createdAt' | 'expiresAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}
