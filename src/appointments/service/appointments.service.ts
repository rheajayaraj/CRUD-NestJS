import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from '../schema/appointmets.schema';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Slot } from '../../slots/schema/slots.schema';

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
    if (slot.doctorId.toString() != appointment.doctorId) {
      throw new ForbiddenException(
        'Doctor ID in slot and selected Doctor ID are not the same',
      );
    }
    const now = new Date();
    if (!slot.from || slot.from < now) {
      throw new ForbiddenException('Slot timings are in the past');
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
