import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage, ToolMessage } from '@langchain/core/messages';
import { checkCustomerTool } from '../tools/customer.tool';
import { buildSystemPrompt } from './prompts';
import { SupportStateType, SupportStateUpdate } from '../graph/graph.state';

const SYSTEM_PROMPT = buildSystemPrompt(
  `You are a support assistant for an enterprise accounting system.
  Your task is to obtain the customer's EDRPOU code and verify it using the check_customer tool.
  EDRPOU is an 8-digit company identification code.
  If the customer has not provided it yet - ask for it.
  If the customer has provided it - call the check_customer tool immediately.`,
);

interface CustomerResult {
  found: boolean;
  edrpou?: string;
  name?: string;
  hasActiveSupport?: boolean;
}

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
    const lastMessage = state.messages.at(-1);
    const isAfterToolCall = lastMessage instanceof ToolMessage;

    const response = await this.model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
    ]);

    if (!isAfterToolCall) {
      return { messages: [response] };
    }

    const data = JSON.parse(lastMessage.content as string) as CustomerResult;

    return {
      messages: [response],
      edrpou: data.edrpou ?? null,
      hasActiveSupport: data.hasActiveSupport ?? null,
    };
  }
}
