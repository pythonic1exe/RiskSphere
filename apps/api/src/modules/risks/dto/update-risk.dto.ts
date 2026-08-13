import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { RiskStatus } from '@prisma/client';

export class UpdateRiskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ format: 'uuid' }) @IsOptional() @IsUUID() ownerMembershipId?: string;
  @ApiPropertyOptional({ enum: [RiskStatus.DRAFT, RiskStatus.ACTIVE] }) @IsOptional() @IsIn([RiskStatus.DRAFT, RiskStatus.ACTIVE]) status?: RiskStatus;
}
