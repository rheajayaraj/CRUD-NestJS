import { Module } from '@nestjs/common';
import { UserAgentParser } from './user-agent.parser';

@Module({
  providers: [UserAgentParser],
  exports: [UserAgentParser],
})
export class UtilsModule {}
