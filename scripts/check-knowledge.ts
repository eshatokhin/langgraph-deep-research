import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function check() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? 'support_bot',
  });

  const result = await pool.query(
    'SELECT LEFT(content, 300) as content FROM knowledge_base',
  );
  result.rows.forEach((row, i) => {
    console.log(`\n=== Chunk ${i + 1} ===`);
    console.log(row.content);
  });

  await pool.end();
}

check()
  .catch(console.error)
  .finally(() => process.exit(0));
