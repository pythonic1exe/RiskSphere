import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrganizationBaseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  timezone?: string | null;

  @ApiPropertyOptional()
  locale?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  onboardingCompletedAt?: Date | null;
}

class MembershipRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class MembershipDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [MembershipRoleDto] })
  roles!: MembershipRoleDto[];
}

class OrganizationOnboardingDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  currentStep?: string | null;

  @ApiPropertyOptional()
  lastStep?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  completedAt?: Date | null;
}

class OrganizationRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;
}

class OrganizationOnboardingSummaryDto {
  @ApiProperty({ type: OrganizationBaseDto })
  organization!: OrganizationBaseDto;

  @ApiProperty({ type: OrganizationOnboardingDto })
  onboarding!: OrganizationOnboardingDto;

  @ApiProperty({
    type: Object,
    example: { currentStep: 'GRC_GOALS', lastStep: 'ORGANIZATION_SETUP' },
  })
  resume!: {
    currentStep: string | null;
    lastStep: string | null;
  };

  @ApiProperty({
    type: Object,
    example: { canComplete: true },
  })
  readiness!: {
    canComplete: boolean;
  };

  @ApiProperty({
    type: Object,
    example: { pendingInvitations: 2, selectedFrameworks: 1 },
  })
  counts!: {
    pendingInvitations: number;
    selectedFrameworks: number;
  };
}

export class CreateOrganizationResponseDto {
  @ApiProperty({ type: OrganizationBaseDto })
  organization!: OrganizationBaseDto;

  @ApiProperty({ type: OrganizationOnboardingDto })
  onboarding!: OrganizationOnboardingDto;

  @ApiProperty({ type: MembershipDto })
  membership!: MembershipDto;

  @ApiProperty({ type: [OrganizationRoleDto] })
  roles!: OrganizationRoleDto[];
}

export class OrganizationOnboardingResponseDto extends OrganizationOnboardingSummaryDto {}

export class UpdateOrganizationResponseDto {
  @ApiProperty({ type: OrganizationBaseDto })
  organization!: OrganizationBaseDto;
}

export class UpdateOnboardingProgressResponseDto {
  @ApiProperty({ type: OrganizationOnboardingDto })
  onboarding!: OrganizationOnboardingDto;
}

export class CompleteOnboardingResponseDto {
  @ApiProperty({ type: OrganizationBaseDto })
  organization!: OrganizationBaseDto;

  @ApiProperty({ type: OrganizationOnboardingDto })
  onboarding!: OrganizationOnboardingDto;
}

export { OrganizationOnboardingSummaryDto };
