import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateControlExecutionDto {
  @ApiProperty({ example: 'Q3 2026' }) @IsString() @MinLength(1) periodLabel!: string;
  @ApiProperty() @IsDateString() periodStart!: string;
  @ApiProperty() @IsDateString() periodEnd!: string;
  @ApiProperty() @IsDateString() dueAt!: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() assignedToMembershipId?: string;
}
