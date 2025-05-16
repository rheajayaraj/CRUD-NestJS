import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class LoginHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
