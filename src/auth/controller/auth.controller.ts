import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ForgotPassword, PasswordReset } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Req() request,
  ) {
    return this.authService.login(loginDto.email, loginDto.password, request);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: ForgotPassword) {
    return this.authService.forgotPassword(emailDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: PasswordReset) {
    return this.authService.resetPassword(resetDto);
  }

  @Post('unlock-account')
  async unlockAccount(@Body() body: { email: string }) {
    return this.authService.unlockAccount(body.email);
  }
}
