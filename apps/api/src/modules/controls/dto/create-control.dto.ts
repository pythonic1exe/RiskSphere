import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ControlAutomationType, ControlFrequency, ControlType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateControlDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiProperty({ enum: ControlType }) @IsEnum(ControlType) type!: ControlType;
  @ApiProperty({ enum: ControlAutomationType }) @IsEnum(ControlAutomationType) automationType!: ControlAutomationType;
  @ApiProperty({ enum: ControlFrequency }) @IsEnum(ControlFrequency) frequency!: ControlFrequency;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
}
