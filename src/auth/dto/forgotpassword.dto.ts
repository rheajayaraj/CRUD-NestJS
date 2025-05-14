import { IsEmail } from 'class-validator';

export class PasswordReset {
  @IsEmail()
  email: string;
}
