import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { CreateSlotDto, SlotsQueryDto } from '../dto/slot.dto';
import { SlotsService } from '../service/slots.service';
import { Request } from 'express';
import { UserGuard } from 'src/user/service/user.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { PatientGuard } from 'src/user/service/patient.guard';

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotsService) {}

  @Post('create')
  @UseGuards(UserGuard)
  async createSlots(@Body() dto: CreateSlotDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.createMultipleSlots(dto, user.userId);
  }

  @Get()
  @UseGuards(UserGuard)
  async findAllSlots(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.findAll(user.userId);
  }

  @Get('appointment')
  @UseGuards(PatientGuard)
  async findAllSlotsPatient(
    @Query() query: SlotsQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.findAll(query.doctorId);
  }
}
