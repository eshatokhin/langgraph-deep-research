import { Injectable } from '@nestjs/common';
import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { AIMessage } from '@langchain/core/messages';
import { SupportState, SupportStateType } from './graph.state';
import { GreetingAgent } from '../agents/greeting.agent';
import { VerifyAgent } from '../agents/verify.agent';
import { IntakeAgent } from '../agents/intake.agent';
import { checkCustomerTool } from '../tools/customer.tool';

@Injectable()
export class GraphBuilder {
  constructor(
    private readonly greetingAgent: GreetingAgent,
    private readonly verifyAgent: VerifyAgent,
    private readonly intakeAgent: IntakeAgent,
  ) {}

  build() {
    const graph = new StateGraph(SupportState)
      .addNode('greeting', () => this.greetingAgent.run())
      .addNode('verify', (state) => this.verifyAgent.run(state))
      .addNode('tools', new ToolNode([checkCustomerTool]))
      .addNode('no_support', () => this.noSupportNode())
      .addNode('intake', (state) => this.intakeAgent.run(state))
      .addConditionalEdges(START, (state) => this.router(state))
      .addEdge('greeting', END)
      .addConditionalEdges('verify', toolsCondition)
      .addEdge('tools', 'verify')
      .addEdge('no_support', END)
      .addEdge('intake', END);

    return graph.compile({ checkpointer: new MemorySaver() });
  }

  private noSupportNode(): { messages: AIMessage[] } {
    return {
      messages: [
        new AIMessage(
          'На жаль, у вашої компанії немає активного договору на підтримку. ' +
            'Для отримання допомоги зверніться до вашого менеджера для укладення договору.',
        ),
      ],
    };
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
    if (state.hasActiveSupport === false) return 'no_support';
    if (state.hasActiveSupport === true) return 'intake';
    return END;
  }
}
