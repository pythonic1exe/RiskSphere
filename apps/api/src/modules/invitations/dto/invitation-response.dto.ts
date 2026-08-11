import { ApiProperty } from '@nestjs/swagger';

class InvitationRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class InvitationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  invitedByMembershipId!: string;

  @ApiProperty()
  invitedEmail!: string;

  @ApiProperty()
  invitedEmailNormalized!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ format: 'uuid' })
  roleId!: string;
}

export class CreateInvitationResponseDto {
  @ApiProperty({ type: InvitationDto })
  invitation!: InvitationDto;

  @ApiProperty()
  inviteToken!: string;

  @ApiProperty({ type: InvitationRoleDto })
  role!: InvitationRoleDto;
}

export class RevokeInvitationResponseDto {
  @ApiProperty({ type: InvitationDto })
  invitation!: InvitationDto;
}

class InvitationMembershipRoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

class InvitationMembershipDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: [InvitationMembershipRoleDto] })
  roles!: InvitationMembershipRoleDto[];
}

class InvitationOrganizationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;
}

export class AcceptInvitationResponseDto {
  @ApiProperty({ type: InvitationDto })
  invitation!: InvitationDto;

  @ApiProperty({ type: InvitationMembershipDto })
  membership!: InvitationMembershipDto;

  @ApiProperty({ type: [InvitationMembershipRoleDto] })
  roles!: InvitationMembershipRoleDto[];

  @ApiProperty({ type: InvitationOrganizationDto })
  organization!: InvitationOrganizationDto;
}
