import {
  User,
  UserCreatePayload,
  UserFindByPayload,
  UserQueryPayload,
  UserUpdatePayload,
} from '@bem-ali/types';

import type { UserContractRepository } from './user-contract.repository';

export default class UserInMemoryRepository implements UserContractRepository {
  private items: User[] = [];

  async create(payload: UserCreatePayload): Promise<User> {
    const user: User = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };
    this.items.push(user);
    return user;
  }

  async findBy({ id, email, exact }: UserFindByPayload): Promise<User | null> {
    const user = this.items.find((_user) => {
      if (exact) {
        return (
          (id ? _user.id === id : true) &&
          (email ? _user.email === email : true)
        );
      }
      return _user.id === id || _user.email === email;
    });

    return user ?? null;
  }

  async findMany(payload?: UserQueryPayload): Promise<User[]> {
    let filtered = this.items;

    if (payload?.name) {
      filtered = filtered.filter((user) => user.name === payload.name);
    }

    if (payload?.email) {
      filtered = filtered.filter((user) => user.email === payload.email);
    }

    if (payload?.role) {
      filtered = filtered.filter((user) => user.role === payload.role);
    }

    if (payload?.deleted_at !== undefined) {
      filtered = filtered.filter(
        (user) => user.deleted_at === payload.deleted_at,
      );
    }

    if (payload?.search) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(payload.search!.toLowerCase()) ||
          user.email.toLowerCase().includes(payload.search!.toLowerCase()),
      );
    }

    if (payload?.page && payload?.per_page) {
      const start = (payload.page - 1) * payload.per_page;
      const end = start + payload.per_page;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  async update({ id, ...payload }: UserUpdatePayload): Promise<User> {
    const updated = this.items.find((user) => user.id === id);
    if (!updated) throw new Error('User not found');
    Object.assign(updated, payload, { updated_at: new Date() });
    return updated;
  }

  async delete(id: string): Promise<void> {
    const user = this.items.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, { deleted_at: new Date(), updated_at: new Date() });
  }

  async count(payload?: UserQueryPayload): Promise<number> {
    const filtered = await this.findMany({
      ...payload,
      page: undefined,
      per_page: undefined,
    });

    return filtered.length;
  }
}
