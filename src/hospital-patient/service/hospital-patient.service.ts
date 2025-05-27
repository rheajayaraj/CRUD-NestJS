import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  HospitalPatient,
  HospitalPatientDocument,
} from '../schema/hospital-patient.schema';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/service/mail.service';
import { identifierDTO } from '../dto/hospital-patient.dto';

@Injectable()
export class HospitalPatientService {
  private readonly OTP_EXPIRATION = 10 * 60 * 1000;
  private readonly RECENT_OTP_BLOCK = 2 * 60 * 1000;

  constructor(
    @InjectModel(HospitalPatient.name)
    private hospitalPatientModel: Model<HospitalPatientDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
  ) {}

  async findByIdentifier(identifier: string): Promise<HospitalPatient | null> {
    return this.hospitalPatientModel.findOne({ identifier });
  }

  async create(patientData: any): Promise<HospitalPatient> {
    const createdPatient = new this.hospitalPatientModel(patientData);
    return createdPatient.save();
  }

  async sendOtp(identifier: string) {
    const patient = await this.findByIdentifier(identifier);
    if (!patient) {
      return new NotFoundException(`Patient with ${identifier} not found`);
    }
    const otpKey = `otp:${identifier}`;
    const recentOtpBlockKey = `otp_block:${identifier}`;

    const recentBlock = await this.cacheManager.get<boolean>(recentOtpBlockKey);
    if (recentBlock) {
      throw new ForbiddenException(
        'An OTP was already sent recently. Please wait 2 minutes before requesting a new one.',
      );
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    await this.cacheManager.set(otpKey, otp, this.OTP_EXPIRATION);
    await this.cacheManager.set(recentOtpBlockKey, true, this.RECENT_OTP_BLOCK);

    await this.mailService.sendMail(
      patient.email,
      'Account Creation',
      'welcome',
      {
        name: patient.firstName,
        text: `Your OTP to create your account is ${otp}. It will expire in 10 minutes.`,
      },
    );

    return { message: 'OTP sent to email' };
  }
}
