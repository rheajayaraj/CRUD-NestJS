import { Module } from '@nestjs/common';
import { UserAgentParser } from './user-agent.parser';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [UserAgentParser, SocketGateway],
  exports: [UserAgentParser, SocketGateway],
})
export class UtilsModule {}
