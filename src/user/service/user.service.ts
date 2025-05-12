import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import * as bcrypt from 'bcrypt';
import { HeaderDto, UserQueryDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: User, tenantId): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    let age: number | undefined = undefined;
    if (user.dob) {
      const today = new Date();
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

  async findAll(query: UserQueryDto, tenantId): Promise<User[]> {
    const filter: any = {};
    if (query.name) filter.name = query.name;
    if (query.age !== undefined) filter.age = query.age;
    filter.tenantId = tenantId;
    const users = await this.userModel.find(filter).select('-password').exec();
    if (!users || users.length === 0) {
      throw new NotFoundException(`Users not found`);
    }
    return users;
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    let age: number | undefined = undefined;
    if (user.dob) {
      const today = new Date();
      const birthDate = new Date(user.dob);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    user.age = age ?? user.age;
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .select('-password')
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User not found`);
    }
    return updatedUser;
  }

  async delete(id: string): Promise<User | null> {
    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();
    if (!deletedUser) {
      throw new NotFoundException(`User not found`);
    }
    return deletedUser;
  }
}
