import { Module } from '@nestjs/common';
import { AppointmentsController } from '../controller/appointments.controller';
import { AppointmentsService } from '../service/appointments.service';
import { UserGuard } from 'src/common/utils/user.guard';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Appointment, AppointmentSchema } from '../schema/appointmets.schema';
import { SlotModule } from 'src/slots/module/slots.module';
import { PaymentService } from 'src/payment/service/payment.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, UserGuard, PaymentService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    SlotModule,
    RedisModule,
  ],
  exports: [AppointmentsService, MongooseModule],
})
export class AppointmentsModule {}
