import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { PatientGuard } from '../../common/utils/patient.guard';

@Controller('patient')
@UseGuards(PatientGuard)
export class PatientController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    if (user.type === 'doctor') {
      throw new ForbiddenException('Patient cannot view doctor details');
    }
    return user;
  }
}
