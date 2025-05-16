import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LoginHistory,
  LoginHistorySchema,
} from '../schema/login-history.schema';
import { LoginHistoryService } from '../service/login-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoginHistory.name, schema: LoginHistorySchema },
    ]),
  ],
  providers: [LoginHistoryService],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule {}
