import {
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

@Controller('hospital-patients')
export class HospitalPatientController {
  constructor(
    private readonly hospitalPatientsService: HospitalPatientService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Don't save to disk
    }),
  )
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    const patients = await this.parseCSV(file.buffer);
    const result = await this.hospitalPatientsService.insertMany(patients);
    return {
      message: 'CSV uploaded successfully',
      insertedCount: result.length,
    };
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
