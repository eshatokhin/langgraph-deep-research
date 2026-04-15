import { Injectable } from '@nestjs/common';
import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { AIMessage } from '@langchain/core/messages';
import { SupportState, SupportStateType } from './graph.state';
import { GreetingAgent } from '../agents/greeting.agent';
import { VerifyAgent } from '../agents/verify.agent';
import { checkCustomerTool } from '../tools/customer.tool';

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
      .addNode('tools', new ToolNode([checkCustomerTool]))
      .addConditionalEdges(START, (state) => this.router(state))
      .addEdge('greeting', END)
      .addConditionalEdges('verify', toolsCondition)
      .addEdge('tools', 'verify');

    return graph.compile({ checkpointer: new MemorySaver() });
  }

  private router(state: SupportStateType): string {
    const hasGreeted = state.messages.some((m) => m instanceof AIMessage);

    if (!hasGreeted) {
      const lastMessage = state.messages.at(-1);
      const content = (lastMessage?.content as string) ?? '';
      const containsEdrpou = /\b\d{8}\b/.test(content);
      if (containsEdrpou) return 'verify';
      return 'greeting';
    }

    if (!state.edrpou) return 'verify';
    return END;
  }
}
