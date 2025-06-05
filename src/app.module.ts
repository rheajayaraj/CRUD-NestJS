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
import { AppointmentsService } from './appointments/service/appointments.service';
import { AppointmentsController } from './appointments/controller/appointments.controller';
import { AppointmentsModule } from './appointments/module/appointments.module';
import { MailModule } from './mail/module/mail.module';
import { PaymentModule } from './payment/module/payment.module';
import { RedisModule } from './redis/redis.module';
import { LoginHistoryModule } from './login-history/module/login-history.module';
import { UtilsModule } from './common/utils/utils.module';
import { CallModule } from './call/module/call.module';
import { CallController } from './call/controller/call.controller';
import { SchedulerModule } from './scheduler/module/scheduler.module';
import { SchedulerController } from './scheduler/controller/scheduler.controller';
import { TwilioModule } from './twilio/module/twilio.module';
import { HospitalPatientModule } from './hospital-patient/module/hospital-patient.module';
import { FileService } from './file/service/file.service';
import { UploadController } from './file/controller/file.controller';
import { FileModule } from './file/module/file.module';
import { AdminModule } from './admin/module/admin.module';
import { SocketGateway } from './common/utils/socket.gateway';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DATABASE_URL!),
    UserModule,
    AuthModule,
    SlotModule,
    AppointmentsModule,
    MailModule,
    PaymentModule,
    RedisModule,
    LoginHistoryModule,
    UtilsModule,
    CallModule,
    SchedulerModule,
    TwilioModule,
    HospitalPatientModule,
    FileModule,
    AdminModule,
  ],
  controllers: [
    AppController,
    SlotController,
    AppointmentsController,
    CallController,
    SchedulerController,
  ],
  providers: [
    AppService,
    SlotsService,
    AppointmentsService,
    FileService,
    SocketGateway,
  ],
  exports: [SocketGateway],
})
export class AppModule {}
