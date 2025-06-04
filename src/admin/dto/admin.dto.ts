import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  @ApiProperty({ example: 'Vikram' })
  name: string;
}

export class CreateSlotDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-06-02T19:45:00.000Z' })
  from: Date;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-06-02T19:45:00.000Z' })
  to: Date;

  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  doctorId;
}
