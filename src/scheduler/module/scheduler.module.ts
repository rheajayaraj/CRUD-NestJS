import { Module } from '@nestjs/common';
import { SchedulerController } from '../controller/scheduler.controller';
import { SchedulerService } from '../service/scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AppointmentsModule } from 'src/appointments/module/appointments.module';
import { CallModule } from 'src/call/module/call.module';

@Module({
  imports: [ScheduleModule.forRoot(), AppointmentsModule, CallModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
