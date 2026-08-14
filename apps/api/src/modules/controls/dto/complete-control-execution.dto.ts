import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CompleteControlExecutionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() completionNotes?: string;
}
