import {
  IsEmail,
  IsIn,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

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

export class registerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  age: number;

  @IsIn(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  gender: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;
}
