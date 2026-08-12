import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MyOrganizationRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class MyOrganizationOnboardingDto {
  @ApiProperty()
  status!: string;

  @ApiPropertyOptional({ nullable: true })
  currentStep?: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastStep?: string | null;
}

class MyOrganizationItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ format: 'uuid' })
  membershipId!: string;

  @ApiProperty()
  membershipStatus!: string;

  @ApiProperty({ type: MyOrganizationOnboardingDto, nullable: true })
  onboarding!: MyOrganizationOnboardingDto | null;

  @ApiProperty({ type: [MyOrganizationRoleDto] })
  roles!: MyOrganizationRoleDto[];
}

export class MyOrganizationsResponseDto {
  @ApiProperty({ type: [MyOrganizationItemDto] })
  organizations!: MyOrganizationItemDto[];
}
