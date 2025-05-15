import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('verify')
  async verifyPayment(@Body() paymentDto: PaymentDto) {
    try {
      const payment = await this.paymentService.checkPaymentStatus(paymentDto);

      return {
        success: true,
        message: 'Payment verified successfully',
        payment,
      };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
