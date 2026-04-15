import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage } from '@langchain/core/messages';
import { checkCustomerTool } from '../tools/customer.tool';
import { buildSystemPrompt } from './prompts';
import { SupportStateType, SupportStateUpdate } from '../graph/graph.state';

const SYSTEM_PROMPT =
  buildSystemPrompt(`You are a support assistant for an enterprise accounting system.
Your task is to obtain the customer's EDRPOU code and verify it using the check_customer tool.
EDRPOU is an 8-digit company identification code.
If the customer has not provided it yet - ask for it.
If the customer has provided it - call the check_customer tool immediately.`);

@Injectable()
export class VerifyAgent {
  private readonly model: ChatGroq;

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    }).bindTools([checkCustomerTool]) as ChatGroq;
  }

  async run(state: SupportStateType): Promise<SupportStateUpdate> {
    const response = await this.model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
    ]);

    if (!response.tool_calls?.length) {
      return { messages: [response] };
    }

    const toolCall = response.tool_calls[0];
    const toolMessage = await checkCustomerTool.invoke(toolCall);

    interface CustomerResult {
      found: boolean;
      edrpou?: string;
      name?: string;
      hasActiveSupport?: boolean;
    }

    const data = JSON.parse(toolMessage.content as string) as CustomerResult;

    if (!data.found) {
      const notFoundMessage = await this.model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        ...state.messages,
        response,
        toolMessage,
      ]);

      return { messages: [response, toolMessage, notFoundMessage] };
    }

    const finalResponse = await this.model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
      response,
      toolMessage,
    ]);

    return {
      messages: [response, toolMessage, finalResponse],
      edrpou: data.edrpou ?? null,
      hasActiveSupport: data.hasActiveSupport ?? null,
    };
  }
}
