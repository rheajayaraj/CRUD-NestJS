import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HospitalPatientService } from '../service/hospital-patient.service';
import * as csv from 'csv-parser';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import { Express } from 'express';
import {
  identifierDTO,
  otpDto,
  registerDto,
} from '../dto/hospital-patient.dto';

@Controller('hospital-patients')
export class HospitalPatientController {
  constructor(
    private readonly hospitalPatientsService: HospitalPatientService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    const patients = await this.parseCSV(file.buffer);

    let insertedCount = 0;

    for (const patient of patients) {
      const exists = await this.hospitalPatientsService.findByIdentifier(
        patient.identifier,
      );
      if (!exists) {
        await this.hospitalPatientsService.create(patient);
        insertedCount++;
      }
    }

    return {
      message: 'CSV processed',
      insertedCount,
    };
  }

  @Post('otp')
  async sendOtp(@Body() identifier: identifierDTO) {
    return this.hospitalPatientsService.sendOtp(identifier.identifier);
  }

  @Post('verify')
  async verifyOtp(@Body() otpData: otpDto) {
    return this.hospitalPatientsService.verifyOtp(otpData);
  }

  @Post('register')
  async register(
    @Body() registerData: registerDto,
    @Headers('authorization') token: string,
  ) {
    return this.hospitalPatientsService.register(registerData, token);
  }

  @Post('phone-otp')
  async sendPhoneOtp(@Body() identifier: identifierDTO) {
    return this.hospitalPatientsService.sendPhoneOtp(identifier.identifier);
  }

  @Post('phone-verify')
  async verifyPhoneOtp(@Body() otpData: otpDto) {
    return this.hospitalPatientsService.verifyPhoneOtp(otpData);
  }

  private parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }
}
