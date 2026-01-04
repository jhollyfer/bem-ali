import { defineConfig } from 'drizzle-kit';

import { config } from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: false });
} else {
  config({ override: false });
}

export default defineConfig({
  out: './drizzle',
  schema: './database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
