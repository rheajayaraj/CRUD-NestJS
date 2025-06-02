import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Hospital, HospitalDocument } from '../schema/hospital.schema';
import { CreateSlotDto } from '../dto/admin.dto';
import { Slot, SlotDocument } from 'src/slots/schema/slots.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
      .exec();
  }

  async createUser(user: User, tenantId): Promise<User> {
    const oldUser = await this.findOneByEmail(user.email);
    if (oldUser) {
      throw new ForbiddenException('User already exists');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    let age: number | undefined = undefined;
    if (user.dob) {
      const now = new Date();
      const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      const birthDate = new Date(user.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    const newUser = new this.userModel({
      ...user,
      password: hashedPassword,
      age: age ?? user.age,
      tenantId: new Types.ObjectId(tenantId),
    });
    await newUser.save();
    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async users() {
    const users = await this.userModel.find().exec();
    if (!users || users.length == 0) {
      throw new NotFoundException('Users not found');
    }
    return users;
  }

  async createHospital(hospital: Hospital): Promise<Hospital> {
    const oldHospital = await this.hospitalModel
      .findOne({ name: hospital.name })
      .exec();
    if (oldHospital) {
      throw new ForbiddenException('Hospital already exists');
    }
    return this.hospitalModel.create(hospital);
  }

  async hospitals() {
    const hospitals = await this.hospitalModel.find().exec();
    if (!hospitals || hospitals.length == 0) {
      throw new NotFoundException('Hospitals not found');
    }
    return hospitals;
  }

  async createMultipleSlots(dto: CreateSlotDto) {
    const user = await this.userModel.findById(dto.doctorId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.type != 'doctor') {
      throw new ForbiddenException('Selected user is not a doctor');
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
        doctorId: dto.doctorId,
        from: current,
        to: next,
        type: 'available',
      });

      if (!exists) {
        slots.push({
          from: new Date(current),
          to: new Date(next),
          doctorId: dto.doctorId,
          type: 'available',
        });
      }

      current = next;
    }

    return this.slotModel.insertMany(slots);
  }
}
