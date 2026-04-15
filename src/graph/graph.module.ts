import { Module } from '@nestjs/common';
import { GraphBuilder } from './graph.builder';
import { GraphService } from './graph.service';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [GraphBuilder, GraphService],
  exports: [GraphService],
})
export class GraphModule {}
