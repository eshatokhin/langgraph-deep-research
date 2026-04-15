import { Module } from '@nestjs/common';
import { GreetingAgent } from './greeting.agent';
import { VerifyAgent } from './verify.agent';

@Module({
  providers: [GreetingAgent, VerifyAgent],
  exports: [GreetingAgent, VerifyAgent],
})
export class AgentsModule {}
