import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
