import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'admin@risksphere.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password1234' })
  @IsString()
  @MinLength(8)
  password!: string;
}
