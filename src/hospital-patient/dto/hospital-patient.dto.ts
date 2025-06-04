import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class identifierDTO {
  @IsString()
  @ApiProperty({ example: '12345' })
  identifier: string;
}

export class otpDto {
  @IsString()
  @ApiProperty({ example: '12345' })
  identifier: string;

  @IsString()
  @ApiProperty({ example: '789654' })
  otp: string;
}

export class registerDto {
  @IsString()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsNumber()
  @ApiProperty({ example: 25 })
  age: number;

  @IsIn(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  @ApiProperty({ example: 'Male' })
  gender: string;

  @IsPhoneNumber('IN')
  @ApiProperty({ example: '1234567890' })
  phone: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '123 Street, City, Country' })
  address: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  photo?: string;
}
