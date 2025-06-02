import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateHospitalDto {
  @IsString()
  name: string;
}

export class CreateSlotDto {
  @IsNotEmpty()
  @IsDateString()
  from: Date;

  @IsNotEmpty()
  @IsDateString()
  to: Date;

  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  doctorId;
}
