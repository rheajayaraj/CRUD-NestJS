import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export interface AppointmentLogEntry {
  event: string;
  userId: string;
  userType?: string;
  type: 'email' | 'call' | 'sms';
}

@Schema()
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  doctorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  patientId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Slot', required: true })
  slotId: MongooseSchema.Types.ObjectId;

  @Prop()
  status: string;

  @Prop({ default: 'pending' })
  payment: string;

  @Prop()
  paymemtId: string;

  @Prop({
    type: [
      {
        event: { type: String, required: true },
        userId: { type: String, required: true },
        userType: { type: String },
        type: { type: String, enum: ['email', 'call', 'sms'], required: true },
      },
    ],
    default: [],
  })
  log: AppointmentLogEntry[];
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
