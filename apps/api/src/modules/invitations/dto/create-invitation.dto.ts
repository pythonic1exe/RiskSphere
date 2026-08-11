import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsEmail, IsString } from 'class-validator';

import { ORGANIZATION_ROLE_CODES } from '../../../common/auth/auth.constants';

export class CreateInvitationDto {
  @ApiProperty({ example: 'jane@acme.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Object.values(ORGANIZATION_ROLE_CODES), example: ORGANIZATION_ROLE_CODES.VIEWER })
  @IsString()
  @IsIn(Object.values(ORGANIZATION_ROLE_CODES))
  roleCode!: string;
}
