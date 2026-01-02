import type { FastifyReply, FastifyRequest } from 'fastify';
import { Controller, GET } from 'fastify-decorators';

// import { RootDocumentationSchema } from "./root.doc";

@Controller()
export default class {
  @GET({
    url: '',
    options: {
      // schema: RootDocumentationSchema,
    },
  })
  async handle(_: FastifyRequest, response: FastifyReply): Promise<void> {
    // return response.redirect("/documentation").send({
    //   message: "Matis API",
    // });
    return response.send({
      message: 'Bem-Ali API',
    });
  }
}
