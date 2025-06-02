import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type HospitalDocument = Hospital & Document;

@Schema()
export class Hospital {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Prop()
  name: string;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
