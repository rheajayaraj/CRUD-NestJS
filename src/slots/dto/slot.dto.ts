import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  Length,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class CreateSlotDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-06-02T19:45:00.000Z' })
  from?: Date;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({ example: '2025-06-02T19:45:00.000Z' })
  to?: Date;
}

export class DoctorDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  tenantId?: string;
}

export class SlotsQueryDto {
  @IsOptional()
  @Length(24, 24)
  @IsMongoId()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  doctorId?: string;
}
