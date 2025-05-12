import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
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

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new Error('Invalid time range');
    }

    const slots: Slot[] = [];
    let current = new Date(start);

    while (current < end) {
      const next = new Date(current.getTime() + 15 * 60 * 1000);
      if (next > end) break;

      slots.push({
        from: new Date(current),
        to: new Date(next),
        doctorId: doctorId,
        type: 'available',
      });

      current = next;
    }

    return this.slotModel.insertMany(slots);
  }
}
