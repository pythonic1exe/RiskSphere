import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEvidenceVersionDto {
  @ApiPropertyOptional({ description: 'Required for URL evidence.' }) @IsOptional() @IsString() @IsUrl({ require_protocol: true }) externalUrl?: string;
  @ApiPropertyOptional({ description: 'Required for TEXT evidence.' }) @IsOptional() @IsString() textContent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mimeType?: string;
}
