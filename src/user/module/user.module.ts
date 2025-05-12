import { Module } from '@nestjs/common';
import { DoctorController } from '../controller/doctor.controller';
import { PatientController } from '../controller/patient.controller';
import { UserService } from '../service/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [DoctorController, PatientController],
  providers: [UserService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  exports: [UserService, MongooseModule, JwtModule],
})
export class UserModule {}
