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
  from?: Date;

  @IsNotEmpty()
  @IsDateString()
  to?: Date;
}

export class DoctorDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  tenantId?: string;
}

export class SlotsQueryDto {
  @IsOptional()
  @Length(24, 24)
  @IsMongoId()
  doctorId?: string;
}
