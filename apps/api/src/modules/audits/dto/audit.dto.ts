import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditMemberRole, AuditScopeType, AuditStatus, AuditTestResult, AuditTestStatus, AuditType } from '@prisma/client';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateAuditDto {
  @ApiProperty() @IsString() @MinLength(2) code!: string;
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: AuditType }) @IsEnum(AuditType) type!: AuditType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() leadAuditorMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedStartAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedEndAt?: string;
}

export class UpdateAuditDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: AuditType }) @IsOptional() @IsEnum(AuditType) type?: AuditType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() leadAuditorMembershipId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedStartAt?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedEndAt?: string | null;
}

export class ListAuditsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: AuditStatus }) @IsOptional() @IsEnum(AuditStatus) status?: AuditStatus;
  @ApiPropertyOptional({ enum: AuditType }) @IsOptional() @IsEnum(AuditType) type?: AuditType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() leadAuditorMembershipId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() memberMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedStartBefore?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() plannedEndAfter?: string;
  @ApiPropertyOptional({ enum: ['code', 'title', 'plannedStartAt', 'updatedAt', 'status'] }) @IsOptional() @IsIn(['code', 'title', 'plannedStartAt', 'updatedAt', 'status']) sortBy?: 'code' | 'title' | 'plannedStartAt' | 'updatedAt' | 'status';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class CreateAuditMemberDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() membershipId!: string;
  @ApiProperty({ enum: AuditMemberRole }) @IsEnum(AuditMemberRole) role!: AuditMemberRole;
}

export class UpdateAuditMemberDto {
  @ApiProperty({ enum: AuditMemberRole }) @IsEnum(AuditMemberRole) role!: AuditMemberRole;
}

export class CreateAuditScopeDto {
  @ApiProperty({ enum: AuditScopeType }) @IsEnum(AuditScopeType) type!: AuditScopeType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() organizationFrameworkId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() organizationRequirementId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() controlId?: string;
}

export class CreateAuditTestDto {
  @ApiProperty() @IsString() @MinLength(2) code!: string;
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() controlId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() organizationRequirementId?: string;
  @ApiProperty() @IsString() @MinLength(1) procedure!: string;
  @ApiProperty() @IsString() @MinLength(1) expectedResult!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedToMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateAuditTestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) procedure?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) expectedResult?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedToMembershipId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string | null;
}

export class ListAuditTestsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: AuditTestStatus }) @IsOptional() @IsEnum(AuditTestStatus) status?: AuditTestStatus;
  @ApiPropertyOptional({ enum: AuditTestResult }) @IsOptional() @IsEnum(AuditTestResult) result?: AuditTestResult;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedToMembershipId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() controlId?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() organizationRequirementId?: string;
  @ApiPropertyOptional({ enum: ['code', 'title', 'status', 'result', 'updatedAt'] }) @IsOptional() @IsIn(['code', 'title', 'status', 'result', 'updatedAt']) sortBy?: 'code' | 'title' | 'status' | 'result' | 'updatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class CompleteAuditTestDto {
  @ApiProperty({ enum: AuditTestResult }) @IsEnum(AuditTestResult) result!: AuditTestResult;
}

export class LinkAuditTestEvidenceDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() evidenceId!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() evidenceVersionId!: string;
}

export class CreateAuditTestObservationDto {
  @ApiProperty() @IsString() @MinLength(1) content!: string;
}

export class UpdateAuditTestObservationDto {
  @ApiProperty() @IsString() @MinLength(1) content!: string;
}
