import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Slot, SlotDocument } from '../schema/slots.schema';
import { CreateSlotDto } from '../dto/slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectModel(Slot.name) private readonly slotModel: Model<SlotDocument>,
  ) {}

  async createMultipleSlots(dto: CreateSlotDto, doctorId) {
    if (!dto.from || !dto.to) {
      throw new Error('Missing from or to time');
    }

    const start = new Date(dto.from);
    const end = new Date(dto.to);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Start time (from) must be in the future');
    }

    if (end <= start) {
      throw new BadRequestException(
        'End time (to) must be after start time (from)',
      );
    }

    const slots: Slot[] = [];
    let current = new Date(start);

    while (current < end) {
      const next = new Date(current.getTime() + 15 * 60 * 1000);
      if (next > end) break;

      const exists = await this.slotModel.exists({
        doctorId,
        from: current,
        to: next,
        type: 'available',
      });

      if (!exists) {
        slots.push({
          from: new Date(current),
          to: new Date(next),
          doctorId,
          type: 'available',
        });
      }

      current = next;
    }

    return this.slotModel.insertMany(slots);
  }

  async findAll(doctorId): Promise<Slot[]> {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const filter: any = {
      type: 'available',
      from: { $gt: localNow },
    };
    if (doctorId) {
      filter['doctorId'] = doctorId;
    }
    const slots = await this.slotModel.find(filter).exec();
    if (!slots || slots.length === 0) {
      throw new NotFoundException(`Slots not found`);
    }
    return slots;
  }
}
