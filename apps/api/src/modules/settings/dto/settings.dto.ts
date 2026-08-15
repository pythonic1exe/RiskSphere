import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDensity } from '@prisma/client';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export const SETTINGS_START_PAGES = ['/workspace', '/risks', '/controls', '/compliance', '/evidence', '/audits', '/findings', '/tasks', '/organization', '/settings'] as const;
export const SETTINGS_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const;

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Usman Shakeel' }) @IsOptional() @IsString() @MinLength(2) displayName?: string | null;
  @ApiPropertyOptional({ example: 'GRC Analyst' }) @IsOptional() @IsString() jobTitle?: string | null;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: 'Asia/Karachi', nullable: true }) @IsOptional() @IsString() timezone?: string | null;
  @ApiPropertyOptional({ enum: SETTINGS_DATE_FORMATS, nullable: true }) @IsOptional() @IsIn(SETTINGS_DATE_FORMATS) dateFormat?: typeof SETTINGS_DATE_FORMATS[number] | null;
  @ApiPropertyOptional({ enum: SETTINGS_START_PAGES, nullable: true }) @IsOptional() @IsIn(SETTINGS_START_PAGES) startPage?: typeof SETTINGS_START_PAGES[number] | null;
  @ApiPropertyOptional({ enum: UserDensity }) @IsOptional() @IsIn(Object.values(UserDensity)) density?: UserDensity;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() emailEnabled?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(1) currentPassword!: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword!: string;
}

export class UpdateOrganizationSettingsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 365, nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(365) riskReviewFrequencyDays?: number | null;
  @ApiPropertyOptional({ minimum: 1, maximum: 365, nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(365) findingDefaultDueDays?: number | null;
  @ApiPropertyOptional({ minimum: 1, maximum: 365, nullable: true }) @IsOptional() @IsInt() @Min(1) @Max(365) defaultTaskDueDays?: number | null;
}
