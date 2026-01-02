import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';

import GetUsersUseCase from './get-users.use-case';

@Controller({
  route: '/users',
})
export default class {
  constructor(private readonly useCase: GetUsersUseCase) {}

  @GET({
    url: '/',
    options: {
      // schema: RootDocumentationSchema,
    },
  })
  async handle(_: FastifyRequest, response: FastifyReply): Promise<void> {
    const result = await this.useCase.execute();

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
