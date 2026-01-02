import { JWTPayload, User } from '@bem-ali/types';
import type { FastifyReply } from 'fastify';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const createTokens = async (
  user: Pick<User, 'id' | 'email' | 'role'>,
  response: FastifyReply,
): Promise<TokenPair> => {
  const jwt: JWTPayload = {
    sub: user.id.toString(),
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const accessToken = await response.jwtSign(jwt, {
    sub: user.id.toString(),
    expiresIn: '24h',
  });

  const refreshToken = await response.jwtSign(
    {
      sub: user.id.toString(),
      type: 'refresh',
    },
    {
      sub: user.id.toString(),
      expiresIn: '7d',
    },
  );

  return { accessToken, refreshToken };
};
