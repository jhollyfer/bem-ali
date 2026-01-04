import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

type Database = ReturnType<typeof drizzle<typeof schema>>;

let _db: Database | null = null;

export function getDatabase(): Database {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    _db = drizzle({ client: pool, schema });
  }
  return _db;
}

export const database = new Proxy({} as Database, {
  get(_, prop): unknown {
    const db = getDatabase();
    const value = db[prop as keyof Database];
    return typeof value === 'function' ? value.bind(db) : value;
  },
});
