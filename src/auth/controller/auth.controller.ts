import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ForgotPassword, PasswordReset } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() emailDto: ForgotPassword) {
    return this.authService.forgotPassword(emailDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: PasswordReset) {
    return this.authService.resetPassword(resetDto);
  }
}
