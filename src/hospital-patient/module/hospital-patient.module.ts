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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HospitalPatient.name, schema: HospitalPatientSchema },
    ]),
    RedisModule,
    MailModule,
  ],
  providers: [HospitalPatientService],
  controllers: [HospitalPatientController],
})
export class HospitalPatientModule {}
