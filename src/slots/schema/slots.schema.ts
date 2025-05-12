import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SlotDocument = Slot & Document;

@Schema()
export class Slot {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Prop()
  from?: Date;

  @Prop()
  to?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Users', required: true })
  doctorId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'available' })
  type: string;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
