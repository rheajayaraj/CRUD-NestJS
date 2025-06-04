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
import { UserGuard } from 'src/common/utils/user.guard';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { PatientGuard } from 'src/common/utils/patient.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller('slot')
@ApiTags('Slots')
@ApiBearerAuth()
export class SlotController {
  constructor(private readonly slotService: SlotsService) {}

  @Post('create')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'Create slots for a doctor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Doctor's timings data",
    type: CreateSlotDto,
  })
  async createSlots(@Body() dto: CreateSlotDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.createMultipleSlots(dto, user.userId);
  }

  @Get()
  @UseGuards(UserGuard)
  @ApiOperation({ summary: 'List all available slots for a doctor' })
  async findAllSlots(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.findAll(user.userId);
  }

  @Get('appointment')
  @UseGuards(PatientGuard)
  @ApiOperation({ summary: 'List all available slots to book to a patient' })
  async findAllSlotsPatient(
    @Query() query: SlotsQueryDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (!user?.userId) throw new BadRequestException('Unauthorized access');
    return this.slotService.findAll(query.doctorId);
  }
}
