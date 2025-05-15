import { IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  paymentId?: string;
}
