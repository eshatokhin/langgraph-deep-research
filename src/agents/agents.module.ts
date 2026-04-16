import { Module } from '@nestjs/common';
import { GreetingAgent } from './greeting.agent';
import { VerifyAgent } from './verify.agent';
import { IntakeAgent } from './intake.agent';
import { ResolveAgent } from './resolve.agent';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [GreetingAgent, VerifyAgent, IntakeAgent, ResolveAgent],
  exports: [GreetingAgent, VerifyAgent, IntakeAgent, ResolveAgent],
})
export class AgentsModule {}
