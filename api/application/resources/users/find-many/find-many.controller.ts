import { UserQueryPayloadSchema } from '@bem-ali/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';

import UsersFindManyUseCase from './find-many.use-case';

@Controller({
  route: '/users',
})
export default class {
  constructor(private readonly useCase: UsersFindManyUseCase) {}

  @GET({
    url: '/',
    options: {
      // schema: RootDocumentationSchema,
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const query = UserQueryPayloadSchema.parse(request.query);
    const result = await this.useCase.execute(query);

    if (result.isLeft()) {
      const error = result.value;
      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    return response.status(200).send(result.value);
  }
}
