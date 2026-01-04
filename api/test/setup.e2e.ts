import 'reflect-metadata';

import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Pool } from 'pg';
import { afterAll, beforeAll } from 'vitest';

config({ path: '.env.test' });

let testSchema: string;
let originalDatabaseUrl: string;

/**
 * Aplica as migrações SQL no schema de teste
 * Lê os arquivos da pasta /drizzle/ e substitui "public" pelo schema dinâmico
 */
async function applyMigrations(pool: Pool, schema: string): Promise<void> {
  const migrationsDir = join(process.cwd(), 'drizzle');

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    let sql = readFileSync(join(migrationsDir, file), 'utf-8');

    // Substituir schema public pelo schema de teste
    sql = sql
      .replace(/"public"\./g, `"${schema}".`)
      .replace(/CREATE TYPE "public"/g, `CREATE TYPE "${schema}"`)
      .replace(/CREATE TABLE "(\w+)"/g, `CREATE TABLE "${schema}"."$1"`)
      .replace(/ALTER TABLE "(\w+)"/g, `ALTER TABLE "${schema}"."$1"`);

    await pool.query(sql);
  }
}

beforeAll(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL!;
  testSchema = `test_${randomUUID().replace(/-/g, '_')}`;

  const pool = new Pool({ connectionString: originalDatabaseUrl });

  await pool.query(`CREATE SCHEMA IF NOT EXISTS "${testSchema}"`);
  await applyMigrations(pool, testSchema);
  await pool.end();

  const url = new URL(originalDatabaseUrl);
  url.searchParams.set('options', `-c search_path=${testSchema}`);
  process.env.DATABASE_URL = url.toString();

  console.log(`🔄 Schema de teste: ${testSchema}`);
});

afterAll(async () => {
  if (testSchema) {
    const pool = new Pool({ connectionString: originalDatabaseUrl });

    try {
      console.log(`🗑️ Removendo schema: ${testSchema}`);
      await pool.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
    } catch (error) {
      console.warn('Erro ao limpar schema:', error);
    } finally {
      await pool.end();
    }
  }

  process.env.DATABASE_URL = originalDatabaseUrl;
});
