import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppointmentsService } from '../../appointments/service/appointments.service';
import { CallService } from '../../call/service/call.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly appointmentsService: AppointmentsService,
    private readonly callService: CallService,
  ) {}

  onModuleInit() {
    //this.logger.log('Initializing scheduler...');
    //this.scheduleReminderChecks();
  }

  private scheduleReminderChecks() {
    const job = new CronJob('*/1 * * * *', async () => {
      this.logger.debug('Cron job running!');
      await this.checkUpcomingAppointments();
    });

    this.schedulerRegistry.addCronJob('appointmentReminders', job);
    job.start();
    this.logger.log('Appointment reminder scheduler started');
  }

  private async checkUpcomingAppointments() {
    this.logger.debug('Checking for upcoming appointments...');
    try {
      const now = new Date();
      const localNow = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );

      const reminderTime = new Date(localNow.getTime() + 15 * 60000);
      console.log(reminderTime);

      const appointments =
        await this.appointmentsService.findAppointmentsBetween(
          reminderTime,
          new Date(reminderTime.getTime() + 5 * 60000),
        );

      this.logger.debug(`Found ${appointments.length} appointments to process`);
      console.log(appointments);

      for (const appointment of appointments) {
        if (appointment.status === 'upcoming') {
          this.logger.debug(`Processing appointment ${appointment._id}`);
          await this.callService.initiateReminderCall(
            appointment._id!.toString(),
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in appointment check:', error);
    }
  }
}
