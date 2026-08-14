import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRequirementStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRequirementAssessmentDto {
  @ApiProperty({ enum: OrganizationRequirementStatus })
  @IsEnum(OrganizationRequirementStatus)
  status!: OrganizationRequirementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rationale?: string;
}
