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
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('payment')
@ApiTags('Payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('verify')
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Payment data',
    type: PaymentDto,
  })
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
  @ApiOperation({ summary: 'Verify a payment using webhooks' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Payment data',
  })
  async handleRazorpayWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(body, signature);
  }
}
