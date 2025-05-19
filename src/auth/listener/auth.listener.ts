import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../../mail/service/mail.service';
import { LoginHistoryService } from 'src/login-history/service/login-history.service';
import { LoginDto } from '../dto/auth.dto';
import { UserAgentParser } from 'src/common/utils/user-agent.parser';
import { Request } from 'express';

@Injectable()
export class LoginListener {
  constructor(
    private readonly mailService: MailService,
    private readonly loginHistoryService: LoginHistoryService,
    private readonly userAgentParser: UserAgentParser,
  ) {}

  @OnEvent('user.login')
  async handleUserLoginEvent(payload: LoginDto & { request?: Request }) {
    const ipAddress = this.getClientIp(payload.request);
    const userAgent = payload.request?.headers['user-agent'] || 'unknown';

    const { os, browser, device } = this.userAgentParser.parse(userAgent);

    await this.loginHistoryService.recordLogin({
      userId: payload.userId?.toString(),
      email: payload.email,
      ipAddress,
      userAgent,
      osType: os,
      browser,
      deviceType: device,
    });

    await this.mailService.sendMail(
      payload.email,
      'New Login Alert',
      'welcome',
      {
        name: '',
        text: `New login detected:
      - Time: ${new Date().toLocaleString()}
      - IP: ${ipAddress}
      - Device: ${device} (${os})
      - Browser: ${browser}
      - OS: ${os}`,
      },
    );
  }

  private getClientIp(request?: Request): string {
    if (!request) return 'unknown';

    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      return Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0].trim();
    }

    return request.socket?.remoteAddress || request.ip || 'unknown';
  }
}
