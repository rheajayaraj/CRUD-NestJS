import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentDto } from '../dto/payment.dto';
const Razorpay = require('razorpay');
import {
  Appointment,
  AppointmentDocument,
} from 'src/appointments/schema/appointmets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount: number, currency = 'INR') {
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_order_${Math.random().toString().slice(2, 10)}`,
      payment_capture: 1,
    };

    return this.razorpay.orders.create(options);
  }

  async checkPaymentStatus(paymentDto: PaymentDto) {
    try {
      const appointment = await this.appointmentModel.findById(
        paymentDto.appointmentId,
      );
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      const payment = await this.razorpay.payments.fetch(paymentDto.paymentId);
      if (!payment) {
        throw new NotFoundException(
          'Payment not found or authentication failed',
        );
      }
      appointment.payment = 'paid';
      appointment.paymemtId = paymentDto.paymentId!;
      await appointment.save();
      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
      };
    } catch (error) {
      throw new NotFoundException('Payment not found or authentication failed');
    }
  }
}
