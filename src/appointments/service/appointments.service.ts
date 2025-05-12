import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from '../schema/appointmets.schema';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from '../dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(
    appointment: CreateAppointmentDto,
    patientId,
  ): Promise<Appointment> {
    const newAppointment = new this.appointmentModel({
      ...appointment,
      patientId,
    });
    return newAppointment.save();
  }
}
