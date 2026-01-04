import { SignInBodySchema, User } from '@bem-ali/types';
import bcrypt from 'bcryptjs';
import { Service } from 'fastify-decorators';
import type z from 'zod';

import { left, right, type Either } from '@application/core/either';
import HTTPException from '@application/core/http-exception';
import { UserContractRepository } from '@application/repositories/users/user-contract.repository';

type Response = Either<HTTPException, Omit<User, 'password'>>;
type Payload = z.infer<typeof SignInBodySchema>;

@Service()
export default class SignInUseCase {
  constructor(private readonly userRepository: UserContractRepository) {}
  async execute(payload: Payload): Promise<Response> {
    try {
      const user = await this.userRepository.findBy({
        email: payload.email,
        exact: true,
      });

      if (!user) return left(HTTPException.Unauthorized());

      const passwordDoesMatch = await bcrypt.compare(
        payload.password,
        user.password,
      );

      if (!passwordDoesMatch)
        return left(HTTPException.Unauthorized('Invalid credentials'));

      return right({
        ...user,
        password: undefined,
      });
    } catch (_error) {
      // console.error(error);
      return left(
        HTTPException.InternalServerError(
          'Internal server error',
          'SIGN_IN_ERROR',
        ),
      );
    }
  }
}
