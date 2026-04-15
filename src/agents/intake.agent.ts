import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { buildSystemPrompt } from './prompts';
import { SupportStateType, SupportStateUpdate } from '../graph/graph.state';

const SYSTEM_PROMPT =
  buildSystemPrompt(`You are a support assistant for an enterprise accounting system.
The customer has been verified. Your task is to collect a description of their problem.
Ask the customer to describe their issue in detail if they haven't done so yet.
Once the customer has described their problem, classify it into one of these categories:
- billing: payment, invoices, subscriptions
- technical: bugs, errors, crashes, performance
- access: login, permissions, accounts
- other: anything else`);

const ClassifySchema = z.object({
  hasDescription: z
    .boolean()
    .describe('true if the customer has already described their problem'),
  issueDescription: z
    .string()
    .nullable()
    .describe('the problem description, or null if not provided yet'),
  issueCategory: z
    .enum(['billing', 'technical', 'access', 'other'])
    .nullable()
    .describe('category, or null if no description yet'),
});

@Injectable()
export class IntakeAgent {
  private readonly model: ChatGroq;

  constructor(private readonly configService: ConfigService) {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async run(state: SupportStateType): Promise<SupportStateUpdate> {
    const structured = this.model.withStructuredOutput(ClassifySchema);

    const result = await structured.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...state.messages,
    ]);

    if (!result.hasDescription) {
      const plainResponse = await this.model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        ...state.messages,
      ]);
      return { messages: [plainResponse] };
    }

    return {
      issueDescription: result.issueDescription,
      issueCategory: result.issueCategory,
    };
  }
}
