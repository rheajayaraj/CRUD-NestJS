import { Module } from '@nestjs/common';
import { TwilioService } from '../service/twilio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
