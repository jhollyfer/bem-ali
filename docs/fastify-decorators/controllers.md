# Fastify Decorators - Controllers

Controller é uma classe decorada com `@Controller` e projetada para lidar com requisições às suas rotas.

---

## Criando um controller

O primeiro passo é criar uma classe e decorá-la:

```ts
import { Controller } from "fastify-decorators";

@Controller()
export default class SimpleController {}
```

### Configuração do decorator Controller

O decorator Controller pode aceitar 2 tipos de opções:

1. **String** que representa a URL da rota que será o caminho raiz dos endpoints do nosso controller. O padrão é `'/'`.

2. **Objeto** que contém `route` representando a URL usada como caminho raiz e `type` para o tipo do controller.
   O controller deve ser um dos dois tipos:
   - `ControllerType.SINGLETON` - cria uma única instância da classe para todas as requisições
   - `ControllerType.REQUEST` - cria uma nova instância da classe por requisição

---

## Criando handlers

O controller é capaz de lidar com diferentes métodos de requisição HTTP com diferentes rotas. Para isso, precisamos declarar um método na classe do controller e decorá-lo com o decorator do método HTTP.

**Lista de decorators disponíveis:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` e `OPTIONS`.

Há também um decorator especial - `ALL` que irá lidar com todos os tipos de requisição.

```ts
import { FastifyRequest, FastifyReply } from "fastify";
import { Controller, GET, POST } from "fastify-decorators";

@Controller()
export default class SimpleController {
  @GET()
  async getHandler(request: FastifyRequest, reply: FastifyReply) {
    return "Olá mundo!";
  }

  @POST()
  async postHandler(request: FastifyRequest, reply: FastifyReply) {
    // Realizando algumas atividades aqui
  }
}
```

Leia [Request Handlers](./Request%20Handlers.md) para mais informações.

---

## Criando hooks

Também existem decorators que permitem usar [Fastify Hooks](https://github.com/fastify/fastify/blob/master/docs/Hooks.md):

```ts
import { Controller, Hook } from "fastify-decorators";

@Controller("/")
export default class SimpleController {
  @Hook("onSend")
  async onSend(request, reply) {
    reply.removeHeader("X-Powered-By");
  }
}
```

---

## Tratamento de erros

`fastify-decorators` fornece recursos para tratar erros com o decorator `@ErrorHandler`.

`@ErrorHandler` pode aceitar um código de erro ou tipo para tratar, ou ficar vazio, o que significa que irá tratar todos os erros. Vamos ver um exemplo:

```ts
import fs from "node:fs";
import path from "node:path";
import { Controller, GET, ErrorHandler } from "fastify-decorators";

class TokenNotFoundError extends Error {}

@Controller("/")
export default class SimpleController {
  @GET("/")
  async get(request, reply) {
    // pode lançar FS_READ_ERROR
    const content = fs.readFileSync(
      path.join(__dirname, request.query.fileName)
    );

    if (!content.includes("token")) {
      throw new TokenNotFoundError(
        "Token não encontrado no arquivo solicitado"
      );
    }

    return { message: "ok" };
  }

  @ErrorHandler(TokenNotFoundError)
  handleTokenNotFound(error: TokenNotFoundError, request, reply) {
    reply.status(403).send({ message: "Você não tem acesso" });
  }
}
```

---

## Referências

- [Request Handlers](./Request%20Handlers.md)
- [Services e Injeção de Dependência](./Services%20and%20dependency%20injection.md)
- [Fastify Hooks](https://github.com/fastify/fastify/blob/master/docs/Hooks.md)
- [RouteConfig](https://github.com/fastify/fastify/blob/master/docs/Routes.md)
