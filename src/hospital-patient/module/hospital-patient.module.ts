import { Module } from '@nestjs/common';
import { HospitalPatientService } from '../service/hospital-patient.service';
import { HospitalPatientController } from '../controller/hospital-patient.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HospitalPatient,
  HospitalPatientSchema,
} from '../schema/hospital-patient.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HospitalPatient.name, schema: HospitalPatientSchema },
    ]),
  ],
  providers: [HospitalPatientService],
  controllers: [HospitalPatientController],
})
export class HospitalPatientModule {}
