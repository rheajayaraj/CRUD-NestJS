import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from '../service/appointments.service';
import { CreateAppointmentDto } from '../dto/appointment.dto';
import { Request } from 'express';
import { PatientGuard } from 'src/common/utils/patient.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('appointment')
export class AppointmentsController {
  mongoose: any;
  constructor(private readonly appointmentService: AppointmentsService) {}

  @Post('create')
  @UseGuards(PatientGuard)
  async create(@Body() appointment: CreateAppointmentDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.appointmentService.create(appointment, user.userId);
  }

  @Get('appointments')
  @UseGuards(PatientGuard)
  async find(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.appointmentService.findAll(user.userId);
  }
}
