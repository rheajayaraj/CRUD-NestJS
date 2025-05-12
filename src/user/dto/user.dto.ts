import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  IsStrongPassword,
} from 'class-validator';
import { UserType } from '../schema/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsString()
  password?: string;

  @IsDateString()
  @IsOptional()
  dob?: Date;

  @IsNumber()
  @Min(18)
  @IsOptional()
  age?: number;

  @IsEnum(UserType)
  @IsNotEmpty()
  @IsOptional()
  type: UserType;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsStrongPassword()
  @IsOptional()
  password?: string;

  @IsDateString()
  @IsOptional()
  dob?: Date;

  @IsNumber()
  @Min(18)
  @IsOptional()
  age?: number;

  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
}
