import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema()
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  doctorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  patientId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Slots', required: true })
  slotId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'pending' })
  payment: string;

  @Prop()
  paymemtId: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
