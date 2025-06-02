import { Module } from '@nestjs/common';
import { AdminController } from '../controller/admin.controller';
import { AdminService } from '../service/admin.service';
import { UserModule } from 'src/user/module/user.module';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HospitalSchema } from '../schema/hospital.schema';
import { SlotModule } from 'src/slots/module/slots.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    RedisModule,
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
    ]),
    SlotModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
