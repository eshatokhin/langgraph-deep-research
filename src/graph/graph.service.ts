import { Injectable, OnModuleInit } from '@nestjs/common';
import { HumanMessage } from '@langchain/core/messages';
import { GraphBuilder } from './graph.builder';
import { SupportStateType } from './graph.state';

@Injectable()
export class GraphService implements OnModuleInit {
  private graph!: ReturnType<GraphBuilder['build']>;

  constructor(private readonly graphBuilder: GraphBuilder) {}

  onModuleInit() {
    this.graph = this.graphBuilder.build();
  }

  async invoke(
    userMessage: string,
    threadId: string,
  ): Promise<SupportStateType> {
    return this.graph.invoke(
      { messages: [new HumanMessage(userMessage)] },
      { configurable: { thread_id: threadId } },
    );
  }
}
