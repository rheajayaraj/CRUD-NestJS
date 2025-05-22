import { Test, TestingModule } from '@nestjs/testing';
import { HospitalPatientController } from './hospital-patient.controller';

describe('HospitalPatientController', () => {
  let controller: HospitalPatientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HospitalPatientController],
    }).compile();

    controller = module.get<HospitalPatientController>(HospitalPatientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
