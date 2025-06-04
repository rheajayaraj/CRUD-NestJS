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
import { UserGuard } from '../../common/utils/user.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  HeaderDto,
} from '../dto/user.dto';
import { UserType } from '../schema/user.schema';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('doctor')
@UseGuards(UserGuard)
@ApiTags('Doctors')
@ApiBearerAuth()
export class DoctorController {
  mongoose: any;
  constructor(private readonly userService: UserService) {}

  @Post('create-doctor')
  @ApiOperation({ summary: 'Create a new doctor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New doctor data',
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
    user.type = UserType.DOCTOR;
    return this.userService.create(user, tenantId);
  }

  @Post('create-patient')
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'New patient data',
    type: CreateUserDto,
  })
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
  @ApiOperation({ summary: 'List all users' })
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
  @ApiOperation({ summary: 'List details of a single user' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User data',
    type: UpdateUserDto,
  })
  update(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
