import { User, UserFindByPayload } from '@bem-ali/types';
import type { SQL } from 'drizzle-orm';
import { and, eq, or } from 'drizzle-orm';
import { Service } from 'fastify-decorators';

import { database } from '@database/index';
import { UserTable } from '@database/schema';

import type { UserContractRepository } from './user-contract.repository';

@Service()
export default class UserDrizzleRepository implements UserContractRepository {
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

  async findAll(): Promise<User[]> {
    return database.select().from(UserTable);
  }
}
