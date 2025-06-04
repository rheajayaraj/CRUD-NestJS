import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Types } from 'mongoose';

export class ForgotPassword {
  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;
}

export class PasswordReset {
  @IsString()
  @ApiProperty({ example: '789654' })
  otp: string;

  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsStrongPassword()
  @ApiProperty({ example: 'Qwerty@123' })
  password: string;
}

export class LoginDto {
  @IsMongoId()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  userId?: string;

  @IsEmail()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty()
  request?: Request;
}
