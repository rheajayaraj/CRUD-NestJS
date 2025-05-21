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
  IsMongoId,
  Length,
  IsPhoneNumber,
} from 'class-validator';
import { UserType } from '../schema/user.schema';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('IN')
  phone: string;

  @IsStrongPassword()
  @IsString()
  password?: string;

  @IsDateString()
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

  @IsPhoneNumber('IN')
  @IsOptional()
  phone?: string;

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

export class UserQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  age?: number;
}

export class HeaderDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  tenantId?: string;
}
