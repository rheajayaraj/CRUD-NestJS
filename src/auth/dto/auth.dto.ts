import {
  IsEmail,
  IsMongoId,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Types } from 'mongoose';

export class ForgotPassword {
  @IsEmail()
  email: string;
}

export class PasswordReset {
  @IsString()
  otp: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}

export class LoginDto {
  @IsMongoId()
  userId?: string;

  @IsEmail()
  email: string;
}
