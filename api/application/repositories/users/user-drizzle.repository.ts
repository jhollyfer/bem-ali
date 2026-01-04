import {
  User,
  UserCreatePayload,
  UserFindByPayload,
  UserQueryPayload,
  UserUpdatePayload,
} from '@bem-ali/types';
import type { SQL } from 'drizzle-orm';
import { and, count, eq, ilike, isNull, or } from 'drizzle-orm';
import { Service } from 'fastify-decorators';

// import { database } from '@database/index';
import { database } from '@database/index';
import { UserTable } from '@database/schema';

import type { UserContractRepository } from './user-contract.repository';

@Service()
export default class UserDrizzleRepository implements UserContractRepository {
  private buildWhereClause(payload?: UserQueryPayload): SQL | undefined {
    const conditions: SQL[] = [];

    if (payload?.name) conditions.push(eq(UserTable.name, payload.name));
    if (payload?.email) conditions.push(eq(UserTable.email, payload.email));
    if (payload?.role) conditions.push(eq(UserTable.role, payload.role));
    if (payload?.deleted_at !== undefined) {
      conditions.push(
        payload.deleted_at === null
          ? isNull(UserTable.deleted_at)
          : eq(UserTable.deleted_at, payload.deleted_at),
      );
    }

    if (payload?.search) {
      conditions.push(
        or(
          ilike(UserTable.name, `%${payload.search}%`),
          ilike(UserTable.email, `%${payload.search}%`),
        )!,
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async create(payload: UserCreatePayload): Promise<User> {
    const [user] = await database.insert(UserTable).values(payload).returning();
    return user;
  }

  async findBy({
    exact = false,
    ...payload
  }: UserFindByPayload): Promise<User | null> {
    const conditions: SQL[] = [];

    if (payload.email) conditions.push(eq(UserTable.email, payload.email));
    if (payload.id) conditions.push(eq(UserTable.id, payload.id));

    if (conditions.length === 0) {
      throw new Error('At least one query is required');
    }

    const whereClause = exact ? and(...conditions) : or(...conditions);

    const [user] = await database
      .select()
      .from(UserTable)
      .where(whereClause)
      .limit(1);

    if (!user) return null;

    return user;
  }

  async findMany(payload?: UserQueryPayload): Promise<User[]> {
    const where = this.buildWhereClause(payload);

    let query = database.select().from(UserTable).where(where).$dynamic();

    if (payload?.page && payload?.per_page) {
      const offset = (payload.page - 1) * payload.per_page;
      query = query.limit(payload.per_page).offset(offset);
    }

    return query;
  }

  async update({ id, ...payload }: UserUpdatePayload): Promise<User> {
    const [user] = await database
      .update(UserTable)
      .set({ ...payload, updated_at: new Date() })
      .where(eq(UserTable.id, id))
      .returning();

    if (!user) throw new Error('User not found');

    return user;
  }

  async delete(id: string): Promise<void> {
    // await database.delete(UserTable).where(eq(UserTable.id, id));
    await database
      .update(UserTable)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(UserTable.id, id));
  }

  async count(payload?: UserQueryPayload): Promise<number> {
    const where = this.buildWhereClause(payload);

    const [result] = await database
      .select({ count: count() })
      .from(UserTable)
      .where(where);

    return result.count;
  }
}
