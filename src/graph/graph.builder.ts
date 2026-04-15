import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { SupportState } from './graph.state';
import { GreetingAgent } from '../agents/greeting.agent';
import { VerifyAgent } from '../agents/verify.agent';

@Injectable()
export class GraphBuilder {
  constructor(
    private readonly greetingAgent: GreetingAgent,
    private readonly verifyAgent: VerifyAgent,
  ) {}

  build() {
    const graph = new StateGraph(SupportState)
      .addNode('greeting', () => this.greetingAgent.run())
      .addNode('verify', (state) => this.verifyAgent.run(state))
      .addEdge(START, 'greeting')
      .addEdge('greeting', 'verify')
      .addEdge('verify', END);

    return graph.compile();
  }
}
