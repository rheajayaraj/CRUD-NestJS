import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginHistory } from '../schema/login-history.schema';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectModel(LoginHistory.name)
    private readonly loginHistoryModel: Model<LoginHistory>,
  ) {}

  async recordLogin(loginData: {
    userId?: string;
    email: string;
    ipAddress: string;
    userAgent: string;
    osType?: string;
    browser?: string;
    deviceType?: string;
  }): Promise<LoginHistory> {
    const loginRecord = new this.loginHistoryModel({
      ...loginData,
      timestamp: new Date(),
    });
    return loginRecord.save();
  }
}
