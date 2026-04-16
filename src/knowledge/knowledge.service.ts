import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { CohereEmbeddings } from '@langchain/cohere';
import { Document } from '@langchain/core/documents';
import { Pool } from 'pg';

const SIMILARITY_THRESHOLD = 0.5; // cosine distance: 0 = identical, 2 = opposite

@Injectable()
export class KnowledgeService implements OnModuleInit, OnModuleDestroy {
  private vectorStore!: PGVectorStore;
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
      port: this.configService.get<number>('POSTGRES_PORT', 5432),
      user: this.configService.get<string>('POSTGRES_USER', 'postgres'),
      password: this.configService.get<string>('POSTGRES_PASSWORD'),
      database: this.configService.get<string>('POSTGRES_DB', 'support_bot'),
    });

    const embeddings = new CohereEmbeddings({
      apiKey: this.configService.get<string>('COHERE_API_KEY'),
      model: 'embed-multilingual-v3.0',
    });

    this.vectorStore = await PGVectorStore.initialize(embeddings, {
      pool: this.pool,
      tableName: 'knowledge_base',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async search(query: string, k = 3): Promise<Document[]> {
    const results = await this.vectorStore.similaritySearchWithScore(query, k);
    return results
      .filter(([, score]) => score <= SIMILARITY_THRESHOLD)
      .map(([doc]) => doc);
  }

  async addDocuments(docs: Document[]): Promise<void> {
    await this.vectorStore.addDocuments(docs);
  }
}
