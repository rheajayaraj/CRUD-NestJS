import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../../mail/service/mail.service';
import { LoginHistoryService } from 'src/login-history/service/login-history.service';

@Injectable()
export class LoginListener {
  constructor(
    private readonly mailService: MailService,
    private readonly loginHistoryService: LoginHistoryService,
  ) {}

  @OnEvent('user.login')
  async handleUserLoginEvent(payload: { userId: string; email: string }) {
    await this.loginHistoryService.recordLogin(payload.userId, payload.email);

    await this.mailService.sendMail(
      payload.email,
      'Successful Login Notification',
      `You have successfully logged in at ${new Date().toLocaleString()}`,
    );
  }
}
