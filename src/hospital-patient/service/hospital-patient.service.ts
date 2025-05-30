import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { otpDto } from '../dto/hospital-patient.dto';
import { JwtService } from '@nestjs/jwt';
import { TwilioService } from 'src/twilio/service/twilio.service';

@Injectable()
export class HospitalPatientService {
  private readonly OTP_EXPIRATION = 10 * 60 * 1000;
  private readonly RECENT_OTP_BLOCK = 2 * 60 * 1000;

  constructor(
    @InjectModel(HospitalPatient.name)
    private hospitalPatientModel: Model<HospitalPatientDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
    private twilioService: TwilioService,
    private jwtService: JwtService,
  ) {}

  async findByIdentifier(
    identifier: string,
  ): Promise<HospitalPatientDocument | null> {
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
    if (patient.isRegistered) {
      throw new ForbiddenException('Patient is already registered');
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

  async verifyOtp(otpData: otpDto) {
    const patient = await this.findByIdentifier(otpData.identifier);
    if (!patient) {
      return new NotFoundException(
        `Patient with ${otpData.identifier} not found`,
      );
    }
    const otpKey = `otp:${otpData.identifier}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);
    if (!storedOtp) {
      throw new ForbiddenException(
        'OTP has expired. Please request a new one.',
      );
    }
    if (otpData.otp !== storedOtp) {
      throw new ForbiddenException('OTP is not valid');
    }
    patient.isEmailVerified = true;
    await patient.save();
    const payload = { identifier: patient.identifier, email: patient.email };
    const jwtToken = this.jwtService.sign(payload);
    return { jwtToken };
  }

  async register(
    registerData: any,
    token: string,
  ): Promise<HospitalPatient | null> {
    try {
      const cleanedToken = token.replace('Bearer ', '');
      const payload = this.jwtService.verify(cleanedToken);
      const patient = await this.findByIdentifier(payload.identifier);
      if (!patient) {
        throw new NotFoundException(
          `Patient not found for identifier ${payload.identifier}`,
        );
      }
      if (patient.isRegistered) {
        throw new ForbiddenException('Patient is already registered');
      }
      if (!patient.isEmailVerified) {
        throw new ForbiddenException('Patient has not verified email yet');
      }
      patient.firstName = registerData.firstName;
      patient.lastName = registerData.lastName;
      patient.age = registerData.age;
      patient.gender = registerData.gender;
      patient.phone = registerData.phone;
      patient.address = registerData.address;
      patient.isRegistered = true;
      if (registerData.photo) {
        patient.photo = registerData.photo;
      }
      return await patient.save();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async sendPhoneOtp(identifier: string) {
    const patient = await this.findByIdentifier(identifier);
    if (!patient) {
      return new NotFoundException(`Patient with ${identifier} not found`);
    }
    if (!patient.isRegistered) {
      throw new ForbiddenException('Patient should register first');
    }
    if (patient.isPhoneVerified) {
      throw new ForbiddenException('Patient has already verified phone');
    }
    const otpKey = `otpPhone:${identifier}`;
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

    await this.twilioService.sendSms(
      '+91' + patient.phone,
      `Your OTP to verify your phone is ${otp}. It will expire in 10 minutes.`,
    );

    return { message: 'OTP sent to phone' };
  }

  async verifyPhoneOtp(otpData) {
    const patient = await this.findByIdentifier(otpData.identifier);
    if (!patient) {
      return new NotFoundException(
        `Patient with ${otpData.identifier} not found`,
      );
    }
    const otpKey = `otpPhone:${otpData.identifier}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);
    if (!storedOtp) {
      throw new ForbiddenException(
        'OTP has expired. Please request a new one.',
      );
    }
    if (otpData.otp !== storedOtp) {
      throw new ForbiddenException('OTP is not valid');
    }
    patient.isPhoneVerified = true;
    await patient.save();
    const payload = {
      identifier: patient.identifier,
      email: patient.email,
      phone: patient.phone,
    };
    const jwtToken = this.jwtService.sign(payload);
    return { jwtToken };
  }
}
