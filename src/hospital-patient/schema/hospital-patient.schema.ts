import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalPatientDocument = HospitalPatient & Document;

@Schema()
export class HospitalPatient {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  identifier: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  address: string;
}

export const HospitalPatientSchema =
  SchemaFactory.createForClass(HospitalPatient);
