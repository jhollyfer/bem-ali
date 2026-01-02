import { User, UserFindByPayload } from '@bem-ali/types';

export abstract class UserContractRepository {
  abstract findBy(payload: UserFindByPayload): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
}
