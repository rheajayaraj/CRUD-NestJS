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

  async recordLogin(userId: string, email: string): Promise<LoginHistory> {
    const loginRecord = new this.loginHistoryModel({
      userId,
      email,
      timestamp: new Date(),
    });
    return loginRecord.save();
  }
}
