import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../schema/user.schema';
import { UserGuard } from '../service/user.guard';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Controller('doctor')
@UseGuards(UserGuard)
export class DoctorController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() user: User) {
    return this.userService.create(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
  //@ismail()
  //@isoptional()
  //isnotempty()
  //email:string

  //forbidden  #/,{}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: Partial<User>) {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
