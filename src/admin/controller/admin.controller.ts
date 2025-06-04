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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
export class AdminController {
  mongoose: any;
  constructor(private readonly adminService: AdminService) {}

  @Post('create-user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New user data',
    type: CreateUserDto,
  })
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
  @ApiOperation({ summary: 'Lists all users' })
  async users() {
    return this.adminService.users();
  }

  @Post('create-hospital')
  @ApiOperation({ summary: 'Create a new hospital' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New hospital data',
    type: CreateHospitalDto,
  })
  async createHospital(@Body() hospital: CreateHospitalDto) {
    return this.adminService.createHospital(hospital);
  }

  @Get('hospitals')
  @ApiOperation({ summary: 'Lists all hospitals' })
  async hospitals() {
    return this.adminService.hospitals();
  }

  @Post('create-slots')
  @ApiOperation({ summary: 'Create appointment slots for a doctor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Slot time data',
    type: CreateSlotDto,
  })
  async createSlots(@Body() slot: CreateSlotDto) {
    return this.adminService.createMultipleSlots(slot);
  }

  @Get('slots')
  @ApiOperation({ summary: 'List all slots for all doctors' })
  async slots() {
    return this.adminService.slots();
  }
}
