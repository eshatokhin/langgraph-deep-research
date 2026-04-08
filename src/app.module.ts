import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResearchModule } from './research/research.module';
import { AgentsModule } from './agents/agents.module';
import { GraphModule } from './graph/graph.module';

@Module({
  imports: [ResearchModule, AgentsModule, GraphModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
