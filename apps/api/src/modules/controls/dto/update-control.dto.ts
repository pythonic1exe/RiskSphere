import { ApiPropertyOptional } from '@nestjs/swagger';
import { ControlAutomationType, ControlFrequency, ControlType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateControlDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ enum: ControlType }) @IsOptional() @IsEnum(ControlType) type?: ControlType;
  @ApiPropertyOptional({ enum: ControlAutomationType }) @IsOptional() @IsEnum(ControlAutomationType) automationType?: ControlAutomationType;
  @ApiPropertyOptional({ enum: ControlFrequency }) @IsOptional() @IsEnum(ControlFrequency) frequency?: ControlFrequency;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
}
