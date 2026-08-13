import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateControlExecutionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) periodLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() periodStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() periodEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueAt?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedToMembershipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() completionNotes?: string;
}
