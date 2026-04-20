import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage } from '@langchain/core/messages';
import { GraphBuilder } from './graph.builder';
import { SupportStateType } from './graph.state';

@Injectable()
export class GraphService implements OnModuleInit {
  private graph!: Awaited<ReturnType<GraphBuilder['build']>>;

  constructor(
    private readonly graphBuilder: GraphBuilder,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const host = this.configService.get<string>('POSTGRES_HOST', 'localhost');
    const port = this.configService.get<number>('POSTGRES_PORT', 5432);
    const user = this.configService.get<string>('POSTGRES_USER', 'postgres');
    const password = this.configService.get<string>('POSTGRES_PASSWORD', '');
    const database = this.configService.get<string>(
      'POSTGRES_DB',
      'support_bot',
    );

    const connString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    this.graph = await this.graphBuilder.build(connString);
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
