import { Module } from '@nestjs/common';
import { SchedulerController } from '../controller/scheduler.controller';
import { SchedulerService } from '../service/scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentsModule } from 'src/appointments/module/appointments.module';
import { CallModule } from 'src/call/module/call.module';
import { MailModule } from 'src/mail/module/mail.module';
import { TwilioModule } from 'src/twilio/module/twilio.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppointmentsModule,
    CallModule,
    MailModule,
    TwilioModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
