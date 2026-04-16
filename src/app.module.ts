import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupportModule } from './support/support.module';
import { AgentsModule } from './agents/agents.module';
import { GraphModule } from './graph/graph.module';
import { KnowledgeModule } from './knowledge/knowledge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupportModule,
    AgentsModule,
    GraphModule,
    KnowledgeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
