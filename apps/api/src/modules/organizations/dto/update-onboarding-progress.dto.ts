import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

import { OrganizationOnboardingStep } from '@prisma/client';

export class UpdateOnboardingProgressDto {
  @ApiPropertyOptional({ enum: OrganizationOnboardingStep })
  @IsOptional()
  @IsIn(Object.values(OrganizationOnboardingStep))
  currentStep?: OrganizationOnboardingStep;

  @ApiPropertyOptional({ enum: OrganizationOnboardingStep })
  @IsOptional()
  @IsIn(Object.values(OrganizationOnboardingStep))
  lastStep?: OrganizationOnboardingStep;

  @ApiPropertyOptional({ example: 'Waiting for final stakeholder review' })
  @IsOptional()
  @IsString()
  notes?: string;
}
