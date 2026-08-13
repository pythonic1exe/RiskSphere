import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComplianceMemberResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
}

export class ComplianceFrameworkResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) organizationId!: string;
  @ApiProperty({ format: 'uuid' }) frameworkCatalogId!: string;
  @ApiProperty() code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() version!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ type: ComplianceMemberResponseDto, nullable: true }) owner!: ComplianceMemberResponseDto | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true }) targetDate!: Date | null;
  @ApiProperty({ type: Object }) summary!: Record<string, number>;
}

export class ComplianceRequirementResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiPropertyOptional({ nullable: true }) domain!: string | null;
  @ApiPropertyOptional({ format: 'uuid', nullable: true }) parentRequirementId!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ type: ComplianceMemberResponseDto, nullable: true }) owner!: ComplianceMemberResponseDto | null;
  @ApiPropertyOptional({ nullable: true }) notes!: string | null;
  @ApiProperty({ type: Object }) linkedControls!: unknown[];
}

export class ComplianceListResponseDto {
  @ApiProperty({ type: [Object] }) data!: unknown[];
  @ApiProperty({ type: Object }) pagination!: Record<string, number>;
}

export class ComplianceAssessmentResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() status!: string;
  @ApiProperty() rationale!: string;
  @ApiProperty({ format: 'uuid' }) assessedByMembershipId!: string;
  @ApiProperty({ type: String, format: 'date-time' }) assessedAt!: Date;
}
