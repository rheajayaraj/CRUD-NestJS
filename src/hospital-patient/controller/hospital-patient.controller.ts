import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Headers,
  BadRequestException,
  ForbiddenException,
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
import * as fileType from 'file-type';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (fileExt !== '.csv') {
      throw new BadRequestException('Only .csv files are allowed.');
    }

    const text = file.buffer.toString('utf-8');
    const [headerLine] = text.split('\n');
    if (!headerLine.includes('identifier') || !headerLine.includes('email')) {
      throw new BadRequestException('Invalid CSV format');
    }

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
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
    }),
  )
  async register(
    @UploadedFile() file: Express.Multer.File,
    @Body() registerData: registerDto,
    @Headers('authorization') token: string,
  ) {
    if (!file || !file.buffer) {
      throw new Error('File is missing or not sent correctly');
    }

    const type = await fileType.fromBuffer(file.buffer);

    if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
      throw new ForbiddenException(
        'Invalid file type. Only JPEG and PNG are allowed.',
      );
    }

    const extension = type.ext;
    const filename = `${uuidv4()}.${extension}`;
    const savePath = path.resolve(process.cwd(), 'uploads', 'photos', filename);

    await fs.mkdir(path.dirname(savePath), { recursive: true });
    await fs.writeFile(savePath, file.buffer);

    registerData.photo = filename;

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
