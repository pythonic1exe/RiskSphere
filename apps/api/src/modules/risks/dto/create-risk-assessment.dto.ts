import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RiskAssessmentType } from '@prisma/client';

export class CreateRiskAssessmentDto {
  @ApiProperty({ enum: RiskAssessmentType }) @IsEnum(RiskAssessmentType) type!: RiskAssessmentType;
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsInt() @Min(1) @Max(5) likelihood!: number;
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsInt() @Min(1) @Max(5) impact!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() rationale?: string;
}
