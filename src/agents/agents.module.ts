import { Module } from '@nestjs/common';
import { GreetingAgent } from './greeting.agent';
import { VerifyAgent } from './verify.agent';
import { IntakeAgent } from './intake.agent';

@Module({
  providers: [GreetingAgent, VerifyAgent, IntakeAgent],
  exports: [GreetingAgent, VerifyAgent, IntakeAgent],
})
export class AgentsModule {}
