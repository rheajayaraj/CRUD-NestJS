import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

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
