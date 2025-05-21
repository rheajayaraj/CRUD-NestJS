import { Module } from '@nestjs/common';
import { CallService } from '../service/call.service';
import { ConfigModule } from '@nestjs/config';
import { AppointmentsModule } from 'src/appointments/module/appointments.module';
import { SlotModule } from 'src/slots/module/slots.module';
import { UserModule } from 'src/user/module/user.module';

@Module({
  imports: [ConfigModule.forRoot(), AppointmentsModule, SlotModule, UserModule],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
