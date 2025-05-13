import { IsNotEmpty, Length, IsMongoId } from 'class-validator';

export class CreateAppointmentDto {
  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  doctorId?: string;

  @Length(24, 24)
  @IsMongoId()
  @IsNotEmpty()
  slotId?: string;
}
