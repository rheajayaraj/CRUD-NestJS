import { IsMongoId, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  paymentId?: string;

  @IsMongoId()
  appointmentId: string;
}
