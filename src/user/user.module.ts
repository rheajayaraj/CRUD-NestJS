import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { PatientController } from './patient.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
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
  exports: [UserService, MongooseModule],
})
export class UserModule {}
