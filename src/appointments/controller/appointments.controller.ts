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
import { UserGuard } from 'src/common/utils/user.guard';

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

  @Get('today-appointments')
  @UseGuards(UserGuard)
  async findToday(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.appointmentService.findTodayAppointments(user.userId);
  }

  @Get('future-appointments')
  @UseGuards(UserGuard)
  async findFuture(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.appointmentService.findFutureAppointments(user.userId);
  }
}
