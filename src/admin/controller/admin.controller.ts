import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto, HeaderDto } from 'src/user/dto/user.dto';
import { AdminService } from '../service/admin.service';
import { AdminGuard } from 'src/common/utils/admin.guard';
import { CreateHospitalDto, CreateSlotDto } from '../dto/admin.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  mongoose: any;
  constructor(private readonly adminService: AdminService) {}

  @Post('create-user')
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
    return this.adminService.createUser(user, tenantId);
  }

  @Get('users')
  async users() {
    return this.adminService.users();
  }

  @Post('create-hospital')
  async createHospital(@Body() hospital: CreateHospitalDto) {
    return this.adminService.createHospital(hospital);
  }

  @Get('hospitals')
  async hospitals() {
    return this.adminService.hospitals();
  }

  @Post('create-slots')
  async createSlots(@Body() slot: CreateSlotDto) {
    return this.adminService.createMultipleSlots(slot);
  }
}
