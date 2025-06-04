import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, IsMongoId } from 'class-validator';

export class CreateAppointmentDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  doctorId?: string;

  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  slotId?: string;
}
