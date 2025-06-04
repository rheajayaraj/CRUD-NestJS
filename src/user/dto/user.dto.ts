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
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsPhoneNumber('IN')
  @ApiProperty({ example: '1234567890' })
  phone: string;

  @IsStrongPassword()
  @IsString()
  @ApiProperty({ example: 'Qwerty@123' })
  password?: string;

  @IsDateString()
  @ApiProperty({ example: '2004-07-26' })
  dob?: Date;

  @IsNumber()
  @Min(18)
  @IsOptional()
  @ApiProperty({ example: '25' })
  age?: number;

  @IsEnum(UserType)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({ example: 'patient', enum: UserType })
  type: UserType;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'John Doe' })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'john.doe@example.com' })
  email?: string;

  @IsPhoneNumber('IN')
  @IsOptional()
  @ApiProperty({ example: '1234567890' })
  phone?: string;

  @IsString()
  @IsStrongPassword()
  @IsOptional()
  @ApiProperty({ example: 'Qwerty@123' })
  password?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: '2004-07-26' })
  dob?: Date;

  @IsNumber()
  @Min(18)
  @IsOptional()
  @ApiProperty({ example: '25' })
  age?: number;

  @IsEnum(UserType)
  @IsOptional()
  @ApiProperty({ example: 'patient', enum: UserType })
  type?: UserType;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John Doe' })
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @ApiProperty({ example: '25' })
  age?: number;
}

export class HeaderDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  tenantId?: string;
}
