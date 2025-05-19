import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Headers,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentDto } from '../dto/payment.dto';

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

  @Post('webhook')
  async handleRazorpayWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(body, signature);
  }
}
