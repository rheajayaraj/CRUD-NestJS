import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from '../service/call.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('call')
@ApiTags('Calls')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Call reminder to a patient for an appoinment' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Patient data',
  })
  async handleCallWebhook(@Body() data: any) {
    console.log(data.callData);
    return this.callService.handleCallResponse(data.callData, data.appointment);
  }
}
