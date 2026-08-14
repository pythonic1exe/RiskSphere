import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateOrganizationRequirementDto {
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) @IsOptional() @IsUUID() ownerMembershipId?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() notes?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() targetDate?: string | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) @IsOptional() @IsDateString() nextReviewAt?: string | null;
  @ApiPropertyOptional({ nullable: true }) @IsOptional() @IsString() applicabilityReason?: string | null;
}
