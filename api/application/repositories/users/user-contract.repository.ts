import {
  User,
  UserCreatePayload,
  UserFindByPayload,
  UserQueryPayload,
  UserUpdatePayload,
} from '@bem-ali/types';

export abstract class UserContractRepository {
  abstract create(payload: UserCreatePayload): Promise<User>;
  abstract findBy(payload: UserFindByPayload): Promise<User | null>;
  abstract findMany(payload?: UserQueryPayload): Promise<User[]>;
  abstract update(payload: UserUpdatePayload): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract count(payload?: UserQueryPayload): Promise<number>;
}
