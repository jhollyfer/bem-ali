import { pgEnum, pgTable } from 'drizzle-orm/pg-core';

export const RoleEnum = pgEnum('role_enum', [
  'MASTER', // -> Dono do sistema, acesso total
  'ADMINISTRATOR', // -> Gestor geral, acesso administrativo
  'OWNER', // -> Proprietário de casa/hotel
  'CUSTOMER', // -> Cliente comum
]);

export const UserTable = pgTable('users', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }).notNull(),
  email: t.varchar({ length: 255 }).notNull().unique(),
  password: t.varchar({ length: 255 }).notNull(),
  role: RoleEnum().default('CUSTOMER').notNull(),
  created_at: t.timestamp('created_at').defaultNow().notNull(),
  updated_at: t.timestamp('updated_at').defaultNow().notNull(),
  deleted_at: t.timestamp('deleted_at'),
}));
