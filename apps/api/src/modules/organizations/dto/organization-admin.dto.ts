import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { InvitationStatus, MembershipStatus } from '@prisma/client';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

import { ORGANIZATION_ROLE_CODES } from '../../../common/auth/auth.constants';

export class ListOrganizationMembersDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: Object.values(ORGANIZATION_ROLE_CODES) }) @IsOptional() @IsIn(Object.values(ORGANIZATION_ROLE_CODES)) role?: string;
  @ApiPropertyOptional({ enum: MembershipStatus }) @IsOptional() @IsEnum(MembershipStatus) status?: MembershipStatus;
  @ApiPropertyOptional({ enum: ['email', 'status', 'createdAt', 'updatedAt'] }) @IsOptional() @IsIn(['email', 'status', 'createdAt', 'updatedAt']) sortBy?: 'email' | 'status' | 'createdAt' | 'updatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class UpdateOrganizationMemberDto {
  @ApiPropertyOptional({ type: [String], enum: Object.values(ORGANIZATION_ROLE_CODES), minItems: 1 }) @IsOptional() @IsArray() @ArrayMinSize(1) @IsString({ each: true }) @IsIn(Object.values(ORGANIZATION_ROLE_CODES), { each: true }) roleCodes?: string[];
  @ApiPropertyOptional({ enum: MembershipStatus }) @IsOptional() @IsEnum(MembershipStatus) status?: MembershipStatus;
}

export class ListOrganizationInvitationsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: InvitationStatus }) @IsOptional() @IsEnum(InvitationStatus) status?: InvitationStatus;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() roleId?: string;
  @ApiPropertyOptional({ enum: ['invitedEmail', 'status', 'createdAt', 'expiresAt'] }) @IsOptional() @IsIn(['invitedEmail', 'status', 'createdAt', 'expiresAt']) sortBy?: 'invitedEmail' | 'status' | 'createdAt' | 'expiresAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class OrganizationUnitDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) code?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() parentId?: string | null;
}

export class UpdateOrganizationUnitDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) code?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() parentId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ListOrganizationUnitsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() parentId?: string | null;
  @ApiPropertyOptional() @IsOptional() isActive?: boolean;
}

export class AssignOrganizationUnitMemberDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() membershipId!: string;
}

export class OrganizationProfileResponseDto { @ApiProperty() organization!: Record<string, unknown>; }
