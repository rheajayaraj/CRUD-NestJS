import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from '../service/call.service';

@Controller('call')
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('webhook')
  async handleCallWebhook(@Body() data: any) {
    console.log(data.callData);
    return this.callService.handleCallResponse(data.callData, data.appointment);
  }
}
