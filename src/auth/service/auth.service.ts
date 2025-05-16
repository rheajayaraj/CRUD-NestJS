import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword, LoginDto, PasswordReset } from '../dto/auth.dto';
import { MailService } from 'src/mail/service/mail.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_LOCK_DURATION = 24 * 60 * 60 * 1000;
  private readonly OTP_EXPIRATION = 10 * 60 * 1000;
  private readonly RECENT_OTP_BLOCK = 2 * 60 * 1000;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .exec();
  }

  async unlockAccount(email: string): Promise<{ message: string }> {
    const lockKey = `login_lock:${email}`;
    const attemptsKey = `login_attempts:${email}`;

    await this.cacheManager.del(lockKey);
    await this.cacheManager.del(attemptsKey);

    return { message: 'Account has been unlocked successfully' };
  }

  async login(
    email: string,
    password: string,
    request: Request,
  ): Promise<{ accessToken: string }> {
    const lockKey = `login_lock:${email}`;
    const isLocked = await this.cacheManager.get<boolean>(lockKey);

    if (isLocked) {
      throw new UnauthorizedException(
        'Account is temporarily locked due to too many failed attempts. Please try again after 24 hours.',
      );
    }

    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const attemptsKey = `login_attempts:${email}`;
      const attempts: number =
        (await this.cacheManager.get<number>(attemptsKey)) || 0;
      const newAttempts = attempts + 1;

      await this.cacheManager.set(
        attemptsKey,
        newAttempts,
        this.LOGIN_LOCK_DURATION,
      );

      if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        await this.cacheManager.set(lockKey, true, this.LOGIN_LOCK_DURATION);
        await this.cacheManager.del(attemptsKey);
        throw new UnauthorizedException(
          'Too many failed attempts. Account locked for 24 hours.',
        );
      }

      throw new UnauthorizedException(
        `Invalid password. Attempts remaining: ${this.MAX_LOGIN_ATTEMPTS - newAttempts}`,
      );
    }

    await this.cacheManager.del(`login_attempts:${email}`);
    await this.cacheManager.del(`login_lock:${email}`);

    const payload = { userId: user._id, type: user.type };
    const accessToken = this.jwtService.sign(payload);

    if (!user._id) {
      throw new Error('User document missing _id');
    }

    const loginDto: LoginDto = {
      userId: user._id.toString(),
      email: user.email,
      request,
    };

    this.eventEmitter.emit('user.login', loginDto);

    return { accessToken };
  }

  async forgotPassword(email: ForgotPassword) {
    const user = await this.findOneByEmail(email.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpKey = `otp:${email.email}`;
    const recentOtpBlockKey = `otp_block:${email.email}`;

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
      email.email,
      'Password Reset OTP',
      `Your OTP to reset password is ${otp}. It will expire in 10 minutes.`,
    );

    return { message: 'OTP sent to email' };
  }

  async resetPassword(resetDto: PasswordReset) {
    const user = await this.findOneByEmail(resetDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpKey = `otp:${resetDto.email}`;
    const storedOtp = await this.cacheManager.get<string>(otpKey);

    if (!storedOtp) {
      throw new ForbiddenException(
        'OTP has expired. Please request a new one.',
      );
    }

    if (resetDto.otp !== storedOtp) {
      throw new ForbiddenException('OTP is not valid');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(resetDto.password, saltRounds);
    user.password = hashedPassword;
    await this.userModel.findByIdAndUpdate(user._id, user).exec();

    await this.cacheManager.del(otpKey);

    return { message: 'Password has been reset successfully' };
  }
}
