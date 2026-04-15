import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { SupportState } from './graph.state';
import { GreetingAgent } from '../agents/greeting.agent';

@Injectable()
export class GraphBuilder {
  constructor(private readonly greetingAgent: GreetingAgent) {}

  build() {
    const graph = new StateGraph(SupportState)
      .addNode('greeting', () => this.greetingAgent.run())
      .addEdge(START, 'greeting')
      .addEdge('greeting', END);

    return graph.compile();
  }
}
