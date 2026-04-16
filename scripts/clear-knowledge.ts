import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function clear() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB ?? 'support_bot',
  });

  const result = await pool.query('DELETE FROM knowledge_base');
  console.log(`Deleted ${result.rowCount} rows.`);

  await pool.end();
}

clear()
  .catch(console.error)
  .finally(() => process.exit(0));
