import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ForgotPassword, PasswordReset } from '../dto/auth.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    const payload = { userId: user._id, type: user.type };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async forgotPassword(email: ForgotPassword) {
    const user = await this.findOneByEmail(email.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otp = '12345';
    await this.mailService.sendMail(
      email.email,
      'Password Reset OTP',
      `Your OTP to reset password is ${otp}`,
    );

    return { message: 'OTP sent to email' };
  }

  async resetPassword(resetDto: PasswordReset) {
    const user = await this.findOneByEmail(resetDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const otp = '12345';
    if (resetDto.otp != otp) {
      throw new ForbiddenException('OTP is not valid');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(resetDto.password, saltRounds);
    user.password = hashedPassword;
    await this.userModel.findByIdAndUpdate(user._id, user).exec();
    return { message: 'Password has been reset successfully' };
  }
}
