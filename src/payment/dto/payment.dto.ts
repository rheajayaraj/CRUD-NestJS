import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @ApiProperty({ example: 'payment-78965' })
  paymentId?: string;

  @IsMongoId()
  @ApiProperty({ example: '683d3a61ea3df298ecb59c44' })
  appointmentId: string;
}
