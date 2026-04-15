import { Injectable } from '@nestjs/common';
import { GraphService } from '../graph/graph.service';

@Injectable()
export class SupportService {
  constructor(private readonly graphService: GraphService) {}

  async handleMessage(userMessage: string) {
    return this.graphService.invoke(userMessage);
  }
}
