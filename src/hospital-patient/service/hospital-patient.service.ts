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

  async findByEmail(email: string): Promise<HospitalPatient | null> {
    return this.hospitalPatientModel.findOne({ email });
  }

  async create(patientData: any): Promise<HospitalPatient> {
    const createdPatient = new this.hospitalPatientModel(patientData);
    return createdPatient.save();
  }
}
