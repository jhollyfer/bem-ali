import { JWTPayload } from '@bem-ali/types';
import '@fastify/jwt';

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: JWTPayload;
  }
}
