import { Module } from '@nestjs/common';
import { HospitalPatientService } from '../service/hospital-patient.service';
import { HospitalPatientController } from '../controller/hospital-patient.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HospitalPatient,
  HospitalPatientSchema,
} from '../schema/hospital-patient.schema';
import { RedisModule } from 'src/redis/redis.module';
import { MailModule } from 'src/mail/module/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { TwilioModule } from 'src/twilio/module/twilio.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HospitalPatient.name, schema: HospitalPatientSchema },
    ]),
    RedisModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    TwilioModule,
  ],
  providers: [HospitalPatientService],
  controllers: [HospitalPatientController],
})
export class HospitalPatientModule {}
