import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalPatientDocument = HospitalPatient & Document;

@Schema()
export class HospitalPatient {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  address: string;
}

export const HospitalPatientSchema =
  SchemaFactory.createForClass(HospitalPatient);
