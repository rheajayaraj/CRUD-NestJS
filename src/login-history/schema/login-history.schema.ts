import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class LoginHistory extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  timestamp: Date;
}

export const LoginHistorySchema = SchemaFactory.createForClass(LoginHistory);
