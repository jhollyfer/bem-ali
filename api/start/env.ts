import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
}

if (!(process.env.NODE_ENV === 'test')) {
  config();
}

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(4000),

  // JWT + COOKIES - CREDENTIALS

  JWT_PUBLIC_KEY: z.string().trim(),
  JWT_PRIVATE_KEY: z.string().trim(),

  COOKIE_SECRET: z.string().trim(),

  // DATABASE
  DATABASE_URL: z.string().trim(),

  DB_HOST: z.string().trim().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string().trim(),
  DB_PASSWORD: z.string().trim(),
  DB_DATABASE: z.string().trim(),

  // ADMINISTRATOR CREDENTIAL
  ADMINISTRATOR_EMAIL: z.email().trim(),
  ADMINISTRATOR_PASSWORD: z.string().trim(),

  SERVER_URL: z.string().trim(),
  CLIENT_URL: z.string().trim(),

  EMAIL_PROVIDER_PASSWORD: z.string().trim(),
  EMAIL_PROVIDER_HOST: z.string().trim(),
  EMAIL_PROVIDER_PORT: z.coerce.number(),
  EMAIL_PROVIDER_USER: z.string().trim(),
});

const validation = schema.safeParse(process.env);

if (!validation.success) {
  console.error('Invalid environment variables', validation.error.format());
  throw new Error('Invalid environment variables');
}

export const Env = validation.data;
