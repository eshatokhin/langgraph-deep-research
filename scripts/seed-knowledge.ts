import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { CohereEmbeddings } from '@langchain/cohere';
import { Pool } from 'pg';

dotenv.config();

const DOCS_DIR = path.join(__dirname, '../docs_src');

const DOCS = [
  {
    file: 'Інструкція користувача з обліку банківських операцій.docx',
    category: 'bank',
  },
];

async function seed() {
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

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  for (const { file, category } of DOCS) {
    console.log(`Loading: ${file}`);
    const loader = new DocxLoader(path.join(DOCS_DIR, file));
    const docs = await loader.load();
    const chunks = await splitter.splitDocuments(docs);

    const enriched = chunks.map((chunk) => ({
      ...chunk,
      metadata: { ...chunk.metadata, category, source: file },
    }));

    console.log(`  Chunks: ${enriched.length}`);
    await vectorStore.addDocuments(enriched);
    console.log(`  Done.`);
  }

  await pool.end();
  console.log('Seeding complete.');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
