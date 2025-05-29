import { Module } from '@nestjs/common';
import { SlotController } from '../controller/slots.controller';
import { SlotsService } from '../service/slots.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from '../schema/slots.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserGuard } from 'src/common/utils/user.guard';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [SlotController],
  providers: [SlotsService, UserGuard],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY!,
      signOptions: { expiresIn: '24h' },
    }),
    RedisModule,
  ],
  exports: [SlotsService, MongooseModule],
})
export class SlotModule {}
