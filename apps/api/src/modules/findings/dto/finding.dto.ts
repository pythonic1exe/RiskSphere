import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FindingEvidencePurpose,
  FindingResolutionType,
  FindingSeverity,
  FindingSourceType,
  FindingStatus,
  FindingValidationDecision,
} from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFindingDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: FindingSeverity }) @IsEnum(FindingSeverity) severity!: FindingSeverity;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() ownerMembershipId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() rootCause?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() impact?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() recommendation?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() remediationPlan?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}

export class PromoteObservationDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiProperty({ enum: FindingSeverity }) @IsEnum(FindingSeverity) severity!: FindingSeverity;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() impact?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() recommendation?: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() ownerMembershipId?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}

export class UpdateFindingDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: FindingSeverity }) @IsOptional() @IsEnum(FindingSeverity) severity?: FindingSeverity;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() ownerMembershipId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() rootCause?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() impact?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() recommendation?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() remediationPlan?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() dueDate?: string | null;
}

export class LinkFindingEvidenceDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID() evidenceVersionId!: string;
  @ApiProperty({ enum: FindingEvidencePurpose }) @IsEnum(FindingEvidencePurpose) purpose!: FindingEvidencePurpose;
}

export class CreateFindingValidationDto {
  @ApiProperty({ enum: FindingValidationDecision }) @IsEnum(FindingValidationDecision) decision!: FindingValidationDecision;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string | null;
  @ApiPropertyOptional({ enum: FindingResolutionType, nullable: true }) @IsOptional() @IsEnum(FindingResolutionType) resolutionType?: FindingResolutionType | null;
  @ApiPropertyOptional() @IsOptional() @IsString() resolutionRationale?: string | null;
}

export class CloseFindingExceptionallyDto {
  @ApiProperty({ enum: FindingResolutionType }) @IsEnum(FindingResolutionType) resolutionType!: FindingResolutionType;
  @ApiProperty() @IsString() @MinLength(1) resolutionRationale!: string;
}

export class ReopenFindingDto {
  @ApiProperty() @IsString() @MinLength(1) rationale!: string;
}

export class ListFindingsDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 }) @IsOptional() @IsInt() @Min(1) page?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(100) pageSize?: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 100 }) @IsOptional() @IsInt() @Min(1) @Max(100) limit?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: FindingStatus }) @IsOptional() @IsEnum(FindingStatus) status?: FindingStatus;
  @ApiPropertyOptional({ enum: FindingSeverity }) @IsOptional() @IsEnum(FindingSeverity) severity?: FindingSeverity;
  @ApiPropertyOptional({ enum: FindingSourceType }) @IsOptional() @IsEnum(FindingSourceType) sourceType?: FindingSourceType;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() overdue?: boolean;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) @IsOptional() @IsDateString() dueBefore?: string;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) @IsOptional() @IsDateString() dueAfter?: string;
  @ApiPropertyOptional({ enum: ['findingNumber', 'title', 'severity', 'status', 'dueDate', 'createdAt', 'updatedAt'] }) @IsOptional() @IsIn(['findingNumber', 'title', 'severity', 'status', 'dueDate', 'createdAt', 'updatedAt']) sortBy?: 'findingNumber' | 'title' | 'severity' | 'status' | 'dueDate' | 'createdAt' | 'updatedAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' }) @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

