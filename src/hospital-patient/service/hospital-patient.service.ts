import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  HospitalPatient,
  HospitalPatientDocument,
} from '../schema/hospital-patient.schema';
import { Model } from 'mongoose';

@Injectable()
export class HospitalPatientService {
  constructor(
    @InjectModel(HospitalPatient.name)
    private hospitalPatientModel: Model<HospitalPatientDocument>,
  ) {}

  async insertMany(data: any[]) {
    return await this.hospitalPatientModel.insertMany(data);
  }
}
