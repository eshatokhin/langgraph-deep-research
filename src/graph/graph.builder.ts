import { Injectable } from '@nestjs/common';
import { StateGraph, START, END } from '@langchain/langgraph';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { AIMessage } from '@langchain/core/messages';
import { SupportState, SupportStateType } from './graph.state';
import { GreetingAgent } from '../agents/greeting.agent';
import { VerifyAgent } from '../agents/verify.agent';
import { IntakeAgent } from '../agents/intake.agent';
import { ResolveAgent } from '../agents/resolve.agent';
import { checkCustomerTool } from '../tools/customer.tool';

@Injectable()
export class GraphBuilder {
  constructor(
    private readonly greetingAgent: GreetingAgent,
    private readonly verifyAgent: VerifyAgent,
    private readonly intakeAgent: IntakeAgent,
    private readonly resolveAgent: ResolveAgent,
  ) {}

  async build(connString: string) {
    const checkpointer = PostgresSaver.fromConnString(connString);
    await checkpointer.setup();

    const graph = new StateGraph(SupportState)
      .addNode('greeting', () => this.greetingAgent.run())
      .addNode('verify', (state) => this.verifyAgent.run(state))
      .addNode('tools', new ToolNode([checkCustomerTool]))
      .addNode('no_support', () => this.noSupportNode())
      .addNode('intake', (state) => this.intakeAgent.run(state))
      .addNode('resolve', (state) => this.resolveAgent.run(state))
      .addNode('escalate', () => this.escalateNode())
      .addConditionalEdges(START, (state) => this.router(state))
      .addEdge('greeting', END)
      .addConditionalEdges('verify', toolsCondition)
      .addEdge('tools', 'verify')
      .addEdge('no_support', END)
      .addConditionalEdges('intake', (state) => this.intakeRouter(state))
      .addConditionalEdges('resolve', (state) => this.resolveRouter(state))
      .addEdge('escalate', END);

    return graph.compile({ checkpointer });
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
    if (state.hasActiveSupport === true && !state.issueDescription)
      return 'intake';
    if (state.issueDescription) return 'resolve';
    return END;
  }

  private intakeRouter(state: SupportStateType): string {
    if (state.issueDescription) return 'resolve';
    return END;
  }

  private resolveRouter(state: SupportStateType): string {
    if (state.resolved) return END;
    return 'escalate';
  }

  private escalateNode(): { messages: AIMessage[] } {
    return {
      messages: [
        new AIMessage(
          'На жаль, у базі знань немає відповіді на ваше питання. ' +
            'Ваш запит буде передано спеціалісту технічної підтримки.',
        ),
      ],
    };
  }
}
