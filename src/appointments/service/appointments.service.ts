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
import { PaymentService } from 'src/payment/service/payment.service';
import { SocketGateway } from '../../common/utils/socket.gateway';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Slot.name)
    private slotModel: Model<Slot>,
    private paymentService: PaymentService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(
    appointment: CreateAppointmentDto,
    patientId,
  ): Promise<{ appointment: Appointment; order: any }> {
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
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    if (!slot.from || slot.from < localNow) {
      throw new ForbiddenException('Slot timings are in the past');
    }
    //const order = await this.paymentService.createOrder(500);
    slot.type = 'booked';
    await slot.save();
    const newAppointment = new this.appointmentModel({
      ...appointment,
      patientId,
      // paymemtId: order.id,
      payment: 'pending',
      status: 'upcoming',
    });
    const savedAppointment = await newAppointment.save();
    this.socketGateway.notifyDoctor(appointment.doctorId, {
      message: `New appointment.`,
      appointment,
    });
    return { appointment: savedAppointment, order: {} };
  }

  async findAll(patientId): Promise<Appointment[]> {
    const appointmets = await this.appointmentModel
      .find({ patientId })
      .populate('doctorId', '-password')
      .populate('patientId', '-password')
      .populate('slotId')
      .exec();
    if (!appointmets || appointmets.length === 0) {
      throw new NotFoundException(`Appointmets not found`);
    }
    return appointmets;
  }

  async findAppointmentsBetween(
    start: Date,
    end: Date,
  ): Promise<AppointmentDocument[]> {
    const allAppointments = await this.appointmentModel
      .find({ status: 'upcoming' })
      .populate('slotId')
      .populate('patientId')
      .populate('doctorId');

    return allAppointments.filter((appointment) => {
      const slot = appointment.slotId as any;
      const from = new Date(slot.from);
      return from >= start && from <= end;
    });
  }

  async findById(id: string): Promise<AppointmentDocument | null> {
    return this.appointmentModel
      .findById(id)
      .populate('slotId')
      .populate('patientId')
      .populate('doctorId');
  }

  async findTodayAppointments(doctorId: string): Promise<Appointment[]> {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const appointments = await this.appointmentModel
      .find({ doctorId, status: 'upcoming' })
      .populate('patientId', '-password')
      .populate('slotId')
      .exec();

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(`Appointments not found`);
    }

    return appointments.filter((appointment) => {
      const slot = appointment.slotId as any;
      const from = new Date(slot.from);
      return from >= startOfToday && from <= endOfToday;
    });
  }

  async findFutureAppointments(doctorId: string): Promise<Appointment[]> {
    const now = new Date();
    const startOfTomorrow = new Date(now.setHours(24, 0, 0, 0));

    const appointments = await this.appointmentModel
      .find({ doctorId, status: 'upcoming' })
      .populate('patientId', '-password')
      .populate('slotId')
      .exec();

    if (!appointments || appointments.length === 0) {
      throw new NotFoundException(`Appointments not found`);
    }

    return appointments.filter((appointment) => {
      const slot = appointment.slotId as any;
      const from = new Date(slot.from);
      return from >= startOfTomorrow;
    });
  }
}
