import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HospitalPatientService } from '../service/hospital-patient.service';
import * as csv from 'csv-parser';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import { Express } from 'express';
import { identifierDTO } from '../dto/hospital-patient.dto';

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
