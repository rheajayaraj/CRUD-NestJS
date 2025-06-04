import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ForgotPassword, LoginDto, PasswordReset } from '../dto/auth.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login to the app' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User login data',
    type: LoginDto,
  })
  async login(
    @Body() loginDto: { email: string; password: string },
    @Req() request,
  ) {
    return this.authService.login(loginDto.email, loginDto.password, request);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send email to user if password forgotten' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Email data',
    type: ForgotPassword,
  })
  async forgotPassword(@Body() emailDto: ForgotPassword) {
    return this.authService.forgotPassword(emailDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Password data',
    type: PasswordReset,
  })
  async resetPassword(@Body() resetDto: PasswordReset) {
    return this.authService.resetPassword(resetDto);
  }

  @Post('unlock-account')
  @ApiOperation({ summary: 'Unlock account after too many unsuccessful tries' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Email data',
  })
  async unlockAccount(@Body() body: { email: string }) {
    return this.authService.unlockAccount(body.email);
  }
}
