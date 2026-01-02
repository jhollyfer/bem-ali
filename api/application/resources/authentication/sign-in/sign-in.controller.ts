import { SignInBodySchema } from '@bem-ali/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, getInstanceByToken, POST } from 'fastify-decorators';

import { setCookieTokens } from '@application/utils/cookies.util';
import { createTokens } from '@application/utils/jwt.util';

import SignInUseCase from './sign-in.use-case';

@Controller({
  route: 'authentication',
})
export default class {
  constructor(
    private readonly useCase: SignInUseCase = getInstanceByToken(SignInUseCase),
  ) {}

  @POST({
    url: '/sign-in',
    options: {
      // schema: SignInDocumentationSchema,
    },
  })
  async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
    const payload = SignInBodySchema.parse(request.body);
    const result = await this.useCase.execute(payload);

    if (result.isLeft()) {
      const error = result.value;

      return response.status(error.code).send({
        message: error.message,
        code: error.code,
        cause: error.cause,
      });
    }

    const tokens = await createTokens(result.value, response);

    setCookieTokens(response, { ...tokens });

    return response.status(200).send();
  }
}
