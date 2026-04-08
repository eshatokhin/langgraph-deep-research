import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';

@Module({
  providers: [ResearchService],
  controllers: [ResearchController],
})
export class ResearchModule {}
