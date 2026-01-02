import { User, UserFindByPayload } from '@bem-ali/types';

import type { UserContractRepository } from './user-contract.repository';

export default class UserInMemoryRepository implements UserContractRepository {
  private users: User[] = [];

  async create(data: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };
    this.users.push(user);
    return user;
  }

  async findBy({ id, email, exact }: UserFindByPayload): Promise<User | null> {
    const user = this.users.find((u) => {
      if (exact) {
        return (id ? u.id === id : true) && (email ? u.email === email : true);
      }
      return u.id === id || u.email === email;
    });
    return user ?? null;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  clear(): void {
    this.users = [];
  }
}
