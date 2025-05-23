import { Module } from '@nestjs/common';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { UserModule } from '../../user/module/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from 'src/mail/module/mail.module';
import { RedisModule } from 'src/redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoginHistoryModule } from 'src/login-history/module/login-history.module';
import { LoginListener } from '../listener/auth.listener';
import { UtilsModule } from 'src/common/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    UserModule,
    MailModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    LoginHistoryModule,
    UtilsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginListener],
})
export class AuthModule {}
