import { Injectable } from '@nestjs/common';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor() {
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
}
