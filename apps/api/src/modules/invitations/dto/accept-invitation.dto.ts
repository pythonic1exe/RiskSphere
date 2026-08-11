import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ minLength: 32 })
  @IsString()
  @MinLength(32)
  token!: string;
}
