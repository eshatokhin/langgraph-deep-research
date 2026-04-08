import { Module } from '@nestjs/common';
import { OrchestratorService } from './orchestrator/orchestrator.service';
import { ResearcherService } from './researcher/researcher.service';
import { AnalystService } from './analyst/analyst.service';
import { WriterService } from './writer/writer.service';

@Module({
  providers: [
    OrchestratorService,
    ResearcherService,
    AnalystService,
    WriterService,
  ],
})
export class AgentsModule {}
