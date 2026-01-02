import { Service } from 'fastify-decorators';

import type { Either } from '@application/core/either';
import { left, right } from '@application/core/either';
import HTTPException from '@application/core/http-exception';
import type { IUser } from '@application/repositories/users/user-contract.repository';
import { UserContractRepository } from '@application/repositories/users/user-contract.repository';

type Response = Either<HTTPException, Array<IUser>>;

@Service()
export default class GetUsersUseCase {
  constructor(private readonly userRepository: UserContractRepository) {}

  async execute(): Promise<Response> {
    try {
      const users = await this.userRepository.findAll();
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
