import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from '../schema/appointmets.schema';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Slot, SlotDocument } from '../../slots/schema/slots.schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Slot.name)
    private slotModel: Model<Slot>,
  ) {}

  async create(
    appointment: CreateAppointmentDto,
    patientId,
  ): Promise<Appointment> {
    const slot = await this.slotModel.findOne({
      _id: appointment.slotId,
      type: 'available',
    });
    if (!slot) {
      throw new NotFoundException('Selected slot is not available');
    }
    slot.type = 'booked';
    await slot.save();
    const newAppointment = new this.appointmentModel({
      ...appointment,
      patientId,
    });
    return newAppointment.save();
  }
}
