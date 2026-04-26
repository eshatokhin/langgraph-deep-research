import * as dotenv from 'dotenv';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { CohereEmbeddings } from '@langchain/cohere';
import { Pool } from 'pg';

dotenv.config();

async function testSearch() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? 'support_bot',
  });

  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY,
    model: 'embed-multilingual-v3.0',
  });

  const vectorStore = await PGVectorStore.initialize(embeddings, {
    pool,
    tableName: 'knowledge_base',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  });

  const queries = [
    'Як налаштувати імпорт з K-Files?',
    'Як зробити об\u0027єднану звітність?',
  ];

  for (const query of queries) {
    console.log(`\n=== Query: "${query}" ===`);
    const results = await vectorStore.similaritySearchWithScore(query, 3);
    results.forEach(([doc, score], i) => {
      console.log(`[${i + 1}] score=${score.toFixed(4)} | ${doc.pageContent.slice(0, 120)}`);
    });
  }

  await pool.end();
}

testSearch().catch(console.error).finally(() => process.exit(0));
