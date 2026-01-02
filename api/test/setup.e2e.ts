import 'reflect-metadata';

import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll } from 'vitest';

config({ path: '.env.test' });

let testSchema: string;
let originalDatabaseUrl: string;

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL!;

  testSchema = randomUUID();

  const url = new URL(originalDatabaseUrl);
  url.searchParams.set('schema', testSchema);
  process.env.DATABASE_URL = url.toString();

  console.log(`🔄 Configurando schema de teste: ${testSchema}`);

  execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
});

afterAll(async () => {
  if (testSchema) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle({ client: pool });

    try {
      console.log(`🗑️ Limpar schema de teste: ${testSchema}`);
      await db.execute(
        sql.raw(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`),
      );
    } catch (error) {
      console.warn('Erro ao limpar schema:', error);
    } finally {
      await pool.end();
    }
  }

  process.env.DATABASE_URL = originalDatabaseUrl;
});
