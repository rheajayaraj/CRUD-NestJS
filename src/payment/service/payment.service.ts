import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentDto } from '../dto/payment.dto';
const Razorpay = require('razorpay');
import {
  Appointment,
  AppointmentDocument,
} from 'src/appointments/schema/appointmets.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import crypto = require('crypto');

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

  async handleWebhook(body: any, signature: string) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret!)
      .update(JSON.stringify(body))
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new NotFoundException('Invalid signature');
    }

    const event = body.event;
    const paymentId = body.payload.payment?.entity?.id;

    switch (event) {
      case 'payment.captured':
        await this.handleSuccessfulPayment(paymentId);
        break;
      case 'payment.failed':
        await this.handleFailedPayment(paymentId);
        break;
      default:
        return new ForbiddenException(`Unhandled event type: ${event}`);
    }

    return { status: 'ok' };
  }

  private async handleSuccessfulPayment(paymentId: string) {
    const appointment = await this.appointmentModel.findOne({
      paymemtId: paymentId,
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment not found for payment: ${paymentId}`,
      );
    }

    appointment.payment = 'paid';
    appointment.paymemtId = paymentId;
    await appointment.save();
    return `Appointment ${appointment._id} marked as paid`;
  }

  private async handleFailedPayment(paymentId: string) {
    const appointment = await this.appointmentModel.findOne({
      paymemtId: paymentId,
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment not found for payment: ${paymentId}`,
      );
    }

    appointment.payment = 'failed';
    appointment.paymemtId = paymentId;
    await appointment.save();

    return `Appointment ${appointment._id} marked as failed`;
  }
}
