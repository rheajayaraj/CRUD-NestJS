import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppointmentsService } from '../../appointments/service/appointments.service';
import { CallService } from '../../call/service/call.service';
import { MailService } from 'src/mail/service/mail.service';
import { PopulatedAppointment } from 'src/appointments/interface/appointment.interface';
import { TwilioService } from 'src/twilio/service/twilio.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly appointmentsService: AppointmentsService,
    private readonly callService: CallService,
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {}

  onModuleInit() {
    //this.logger.log('Initializing scheduler...');
    //this.scheduleReminderChecks();
    this.scheduleMailReminderChecks('30min');
    this.scheduleMailReminderChecks('1day');
  }

  private scheduleReminderChecks() {
    const job = new CronJob('*/5 * * * *', async () => {
      this.logger.debug('Cron job running!');
      await this.checkUpcomingAppointments();
    });

    this.schedulerRegistry.addCronJob('appointmentReminders', job);
    job.start();
    this.logger.log('Appointment reminder scheduler started');
  }

  private scheduleMailReminderChecks(mode: '30min' | '1day') {
    const jobName = `appointmentReminders-${mode}`;
    const job = new CronJob('*/5 * * * *', async () => {
      this.logger.debug(`Cron job running: ${jobName}`);
      await this.checkUpcomingAppointmentsMail(mode);
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`${jobName} scheduler started`);
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
        (await this.appointmentsService.findAppointmentsBetween(
          reminderTime,
          new Date(reminderTime.getTime() + 5 * 60000),
        )) as unknown as PopulatedAppointment[];

      this.logger.debug(`Found ${appointments.length} appointments to process`);

      for (const appointment of appointments) {
        if (appointment.status === 'upcoming') {
          this.logger.debug(`Processing appointment ${appointment._id}`);
          const fullAppointment = await this.appointmentsService.findById(
            appointment._id.toString(),
          );
          await this.callService.initiateReminderCall(
            appointment._id!.toString(),
          );
          fullAppointment!.log.push({
            event: 'join-call-reminder',
            userId: appointment.patientId.toString(),
            userType: 'patient',
            type: 'call',
          });
          await this.twilioService.sendSms(
            '+91' + appointment.patientId.phone,
            `Reminder: Your appointment with Dr. ${appointment.doctorId.name} is scheduled from ${appointment.slotId.from!.toUTCString()} to ${appointment.slotId.to!.toUTCString()}.`,
          );
          fullAppointment!.log.push({
            event: 'join-call-reminder',
            userId: appointment.patientId.toString(),
            userType: 'patient',
            type: 'sms',
          });
          await this.mailService.sendMail(
            appointment.doctorId.email!,
            'Reminder',
            'welcome',
            {
              name: appointment.doctorId.name,
              text: `You have an appoinment with ${appointment.patientId.name} at ${appointment.slotId.from!.toUTCString()} to ${appointment.slotId.to!.toUTCString()}`,
            },
          );
          fullAppointment!.log.push({
            event: 'join-call-reminder',
            userId: appointment.doctorId.toString(),
            userType: 'doctor',
            type: 'email',
          });
        }
      }
    } catch (error) {
      this.logger.error('Error in appointment check:', error);
    }
  }

  private async checkUpcomingAppointmentsMail(mode: '30min' | '1day') {
    this.logger.debug(`Checking for upcoming appointments for mode: ${mode}`);
    try {
      const now = new Date();
      const localNow = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );
      const offsetMinutes = mode === '30min' ? 30 : 24 * 60;
      const windowMinutes = 5;

      const targetTime = new Date(localNow.getTime() + offsetMinutes * 60000);
      const endTime = new Date(targetTime.getTime() + windowMinutes * 60000);
      console.log(targetTime);

      const appointments =
        (await this.appointmentsService.findAppointmentsBetween(
          targetTime,
          endTime,
        )) as unknown as PopulatedAppointment[];

      this.logger.debug(
        `Found ${appointments.length} appointments for ${mode}`,
      );

      for (const appointment of appointments) {
        if (appointment.status !== 'upcoming') continue;

        const fullAppointment = await this.appointmentsService.findById(
          appointment._id.toString(),
        );

        await this.mailService.sendMail(
          appointment.doctorId.email!,
          `Appointment Reminder - ${mode === '1day' ? '1 day' : '30 minutes'} left`,
          'welcome',
          {
            name: appointment.doctorId.name,
            text: `You have an appointment with ${appointment.patientId.name} from ${appointment.slotId.from!.toUTCString()} to ${appointment.slotId.to!.toUTCString()}.`,
          },
        );
        await this.mailService.sendMail(
          appointment.patientId.email!,
          `Appointment Reminder - ${mode === '1day' ? '1 day' : '30 minutes'} left`,
          'welcome',
          {
            name: appointment.patientId.name,
            text: `Your appointment with Dr. ${appointment.doctorId.name} is scheduled from ${appointment.slotId.from!.toUTCString()} to ${appointment.slotId.to!.toUTCString()}.`,
          },
        );
      }
    } catch (error) {
      this.logger.error(`Error in ${mode} reminder check:`, error);
    }
  }
}
