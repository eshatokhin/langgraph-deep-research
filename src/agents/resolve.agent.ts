import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage, AIMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { buildSystemPrompt } from './prompts';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { SupportStateType, SupportStateUpdate } from '../graph/graph.state';

const SYSTEM_PROMPT =
  buildSystemPrompt(`You are a support assistant for an enterprise accounting system called Debet Plus.
Use ONLY the provided knowledge base excerpts to answer the customer's question.
Be specific and reference the instructions when possible.
Do NOT invent, assume, or suggest anything that is not explicitly stated in the knowledge base.`);

const ResolveSchema = z.object({
  resolved: z
    .boolean()
    .describe(
      'true if the knowledge base contained enough information to resolve the issue',
    ),
  response: z
    .string()
    .optional()
    .describe(
      'the answer to send to the customer, required only when resolved is true',
    ),
});

@Injectable()
export class ResolveAgent {
  private readonly model: ChatGroq;

  constructor(
    private readonly configService: ConfigService,
    private readonly knowledgeService: KnowledgeService,
  ) {
    this.model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async run(state: SupportStateType): Promise<SupportStateUpdate> {
    const query = state.issueDescription ?? '';
    const docs = await this.knowledgeService.search(query, 3);

    if (docs.length === 0) {
      return { resolved: false, messages: [] };
    }

    const context = docs
      .map((doc, i) => `[${i + 1}] ${doc.pageContent}`)
      .join('\n\n');

    try {
      const structured = this.model.withStructuredOutput(ResolveSchema);
      const result = await structured.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        ...state.messages,
        new AIMessage(`Knowledge base:\n\n${context}`),
      ]);

      return {
        resolved: result.resolved,
        messages:
          result.resolved && result.response
            ? [new AIMessage(result.response)]
            : [],
      };
    } catch {
      return { resolved: false, messages: [] };
    }
  }
}
