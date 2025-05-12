import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/module/user.module';
import { AuthModule } from './auth/module/auth.module';
import { SlotsService } from './slots/service/slots.service';
import { SlotController } from './slots/controller/slots.controller';
import { SlotModule } from './slots/module/slots.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    UserModule,
    AuthModule,
    SlotModule,
  ],
  controllers: [AppController, SlotController],
  providers: [AppService, SlotsService],
})
export class AppModule {}
