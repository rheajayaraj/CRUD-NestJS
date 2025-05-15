import { Module } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from '../controller/payment.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
