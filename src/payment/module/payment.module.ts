import { Module } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from '../controller/payment.controller';
import { AppointmentsModule } from 'src/appointments/module/appointments.module';

@Module({
  imports: [ConfigModule.forRoot(), AppointmentsModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
