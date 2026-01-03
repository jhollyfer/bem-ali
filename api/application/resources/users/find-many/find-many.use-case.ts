import { User, UserQueryPayload } from '@bem-ali/types';
import { Service } from 'fastify-decorators';

import type { Either } from '@application/core/either';
import { left, right } from '@application/core/either';
import HTTPException from '@application/core/http-exception';
import { UserContractRepository } from '@application/repositories/users/user-contract.repository';

@Service()
export default class UsersFindManyUseCase {
  constructor(private readonly userRepository: UserContractRepository) {}

  async execute(
    payload: UserQueryPayload,
  ): Promise<Either<HTTPException, Array<User>>> {
    try {
      const users = await this.userRepository.findMany(payload);
      return right(users);
    } catch (_error) {
      // console.error(error);
      return left(
        HTTPException.InternalServerError(
          'Internal server error',
          'GET_USERS_ERROR',
        ),
      );
    }
  }
}
