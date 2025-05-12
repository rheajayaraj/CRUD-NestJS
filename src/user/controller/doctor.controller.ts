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
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { UserGuard } from '../service/user.guard';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UserType } from '../schema/user.schema';
import { UserQueryDto } from '../dto/user.dto';

@Controller('doctor')
@UseGuards(UserGuard)
export class DoctorController {
  constructor(private readonly userService: UserService) {}

  @Post('create-doctor')
  createDoctor(@Body() user: CreateUserDto) {
    user.type = UserType.DOCTOR;
    return this.userService.create(user);
  }

  @Post('create-patient')
  createPatient(@Body() user: CreateUserDto) {
    user.type = UserType.PATIENT;
    return this.userService.create(user);
  }

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
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
