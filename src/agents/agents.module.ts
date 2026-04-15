import { Module } from '@nestjs/common';
import { GreetingAgent } from './greeting.agent';

@Module({
  providers: [GreetingAgent],
  exports: [GreetingAgent],
})
export class AgentsModule {}
