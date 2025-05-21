import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Appointment,
  AppointmentDocument,
} from '../../appointments/schema/appointmets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Slot, SlotDocument } from '../../slots/schema/slots.schema';
import axios from 'axios';
import { User, UserDocument } from 'src/user/schema/user.schema';

interface AvailableSlot {
  from: Date;
  optionNumber: number;
}

@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);
  private readonly blandAiApiKey: string;
  private readonly blandAiUrl = 'https://api.bland.ai/v1';

  constructor(
    private configService: ConfigService,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Slot.name)
    private slotModel: Model<SlotDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {
    const apiKey = this.configService.get<string>('BLAND_AI_API_KEY');
    if (!apiKey) {
      throw new Error('BLAND_AI_API_KEY is not configured');
    }
    this.blandAiApiKey = apiKey;
  }

  async initiateReminderCall(appointmentId: string) {
    const appointment = await this.appointmentModel
      .findById(appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('slotId')
      .exec();

    if (
      !appointment ||
      !appointment.patientId ||
      !appointment.doctorId ||
      !appointment.slotId
    ) {
      this.logger.error(
        `Appointment ${appointmentId} not found or missing required data`,
      );
      return;
    }

    const patient = await this.userModel.findById(appointment.patientId).exec();
    if (!patient?.phone) {
      this.logger.error(
        `Patient phone number not found for appointment ${appointmentId}`,
      );
      return;
    }

    const callScript = await this.generateCallScript(appointment);
    if (!callScript) {
      this.logger.error(
        `Call script could not be generated for appointment ${appointmentId}`,
      );
      return;
    }

    const phoneNumber = patient.phone;

    try {
      const response = await axios.post(
        `${this.blandAiUrl}/calls`,
        {
          phone_number: '+91' + phoneNumber,
          task: callScript,
          voice: 'June',
          wait_for_greeting: false,
          record: true,
          answered_by_enabled: true,
          noise_cancellation: false,
          interruption_threshold: 100,
          block_interruptions: false,
          max_duration: 12,
          model: 'base',
          language: 'en',
          background_track: 'none',
          endpoint: 'https://api.bland.ai',
          voicemail_action: 'hangup',
          webhook: this.configService.get<string>('BLAND_AI_WEBHOOK_URL'),
        },
        {
          headers: {
            Authorization: this.blandAiApiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `Call initiated for appointment ${appointmentId}: ${response.data}`,
      );

      await this.handleCallResponse(response.data, appointment);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to initiate call: ${error.message}`);
      throw error;
    }
  }

  private async getAvailableSlots(doctorId: string): Promise<AvailableSlot[]> {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const slots = await this.slotModel
      .find({
        doctorId: new Types.ObjectId(doctorId),
        type: 'available',
        from: { $gt: localNow },
      })
      .sort({ from: 1 })
      .limit(5)
      .lean()
      .exec();

    return slots.reduce<AvailableSlot[]>((acc, slot, index) => {
      if (slot.from) {
        acc.push({
          from: slot.from,
          optionNumber: index + 2,
        });
      }
      return acc;
    }, []);
  }

  private async generateCallScript(
    appointment: AppointmentDocument,
  ): Promise<string> {
    const doctor = await this.userModel.findById(appointment.doctorId).exec();
    const slot = await this.slotModel.findById(appointment.slotId).exec();

    if (!doctor || !doctor.name || !slot || !slot.from) {
      this.logger.error(
        `Doctor or slot not found for appointment ${appointment._id}`,
      );
      return '';
    }

    const doctorName = doctor.name;
    const appointmentTime = slot.from.toLocaleString();
    const availableSlots = await this.getAvailableSlots(doctor._id.toString());

    const slotOptions = availableSlots
      .map((slot, i) => `Press ${i + 2} for ${slot.from.toLocaleString()}`)
      .join('. ');

    return `
      Hello, this is an automated reminder from your healthcare provider.
      You have an appointment with Dr. ${doctorName} at ${appointmentTime}.
  
      Will you be attending this appointment?
      Press 1 for Yes, I'll be there.
      If you want to reschedule:
      
      ${slotOptions}
      
      If you need further assistance, please stay on the line to speak with our staff.
    `;
  }

  async handleCallResponse(callData: any, appointment: any) {
    console.log(callData, appointment);
    const transcript = callData.transcript?.toLowerCase() || '';

    const selectedOption = this.parseResponse(transcript);

    switch (selectedOption) {
      case 1:
        await this.appointmentModel.updateOne(
          { _id: appointment._id },
          { $set: { status: 'confirmed' } },
        );
        this.logger.log(`Appointment ${appointment._id} confirmed`);
        break;

      default:
        if (selectedOption >= 2) {
          await this.processReschedule(appointment, selectedOption);
        }
    }
  }

  private async processReschedule(appointment: any, selectedOption: number) {
    const availableSlots = await this.getAvailableSlots(
      appointment.doctorId._id.toString(),
    );

    const selectedSlot = availableSlots.find(
      (s) => s.optionNumber === selectedOption,
    );

    if (!selectedSlot) {
      this.logger.error(`Selected slot not found for option ${selectedOption}`);
      return;
    }

    await this.slotModel.updateOne(
      { _id: appointment.slotId._id },
      { $set: { type: 'available' } },
    );

    const newSlot = await this.slotModel
      .findOne({
        doctorId: appointment.doctorId._id,
        from: selectedSlot.from,
        type: 'available',
      })
      .exec();

    if (newSlot) {
      await this.slotModel.updateOne(
        { _id: newSlot._id },
        { $set: { type: 'booked' } },
      );

      await this.appointmentModel.updateOne(
        { _id: appointment._id },
        {
          $set: {
            slotId: newSlot._id,
            status: 'rescheduled',
          },
        },
      );

      this.logger.log(
        `Appointment ${appointment._id} rescheduled to ${newSlot.from}`,
      );
    } else {
      this.logger.error(`Slot no longer available for rescheduling`);
    }
  }

  private parseResponse(response: string): number {
    if (response.includes('1') || response.includes('yes')) return 1;
    if (response.includes('2') || response.includes('no')) return 2;

    const match = response.match(/\b(\d)\b/);
    return match ? parseInt(match[1]) : 0;
  }
}
