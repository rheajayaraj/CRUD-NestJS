import { IsString } from 'class-validator';

export class identifierDTO {
  @IsString()
  identifier: string;
}

export class otpDto {
  @IsString()
  identifier: string;

  @IsString()
  otp: string;
}
