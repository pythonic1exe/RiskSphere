import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RiskTreatmentStatus, RiskTreatmentStrategy } from '@prisma/client';

export class UpdateRiskTreatmentDto {
  @ApiProperty({ enum: RiskTreatmentStrategy }) @IsEnum(RiskTreatmentStrategy) strategy!: RiskTreatmentStrategy;
  @ApiPropertyOptional({ enum: RiskTreatmentStatus }) @IsOptional() @IsEnum(RiskTreatmentStatus) status?: RiskTreatmentStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() plan?: string;
  @ApiPropertyOptional({ format: 'date-time' }) @IsOptional() @IsDateString() targetDate?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
}
