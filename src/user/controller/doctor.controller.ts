import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserGuard } from '../service/user.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  HeaderDto,
} from '../dto/user.dto';
import { UserType } from '../schema/user.schema';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('doctor')
@UseGuards(UserGuard)
export class DoctorController {
  mongoose: any;
  constructor(private readonly userService: UserService) {}

  @Post('create-doctor')
  async createDoctor(
    @Body() user: CreateUserDto,
    @Headers('tenant-id') tenantId: string,
  ) {
    const headerDto = plainToInstance(HeaderDto, { tenantId });
    const errors = await validate(headerDto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');

      throw new BadRequestException(errorMessages);
    }
    user.type = UserType.DOCTOR;
    return this.userService.create(user, tenantId);
  }

  @Post('create-patient')
  async createPatient(
    @Body() user: CreateUserDto,
    @Headers('tenant-id') tenantId: string,
  ) {
    const headerDto = plainToInstance(HeaderDto, { tenantId });
    const errors = await validate(headerDto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');

      throw new BadRequestException(errorMessages);
    }
    user.type = UserType.PATIENT;
    return this.userService.create(user, tenantId);
  }

  @Get()
  async findAll(
    @Query() query: UserQueryDto,
    @Headers('tenant-id') tenantId: string,
  ) {
    const headerDto = plainToInstance(HeaderDto, { tenantId });
    const errors = await validate(headerDto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');

      throw new BadRequestException(errorMessages);
    }
    return this.userService.findAll(query, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
