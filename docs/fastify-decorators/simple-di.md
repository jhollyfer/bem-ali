<h1 style="text-align: center">@fastify-decorators/simple-di</h1>

[![npm version](https://badge.fury.io/js/@fastify-decorators%2Fsimple-di.svg)](https://badge.fury.io/js/@fastify-decorators%2Fsimple-di)
[![npm](https://img.shields.io/npm/dm/@fastify-decorators/simple-di.svg?colorB=brightgreen)](https://www.npmjs.com/package/@fastify-decorators/simple-di)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

## Injeção de Dependência

Injeção de dependência (DI) é um mecanismo amplamente utilizado para conectar automaticamente dependências de controllers/services.
No fastify-decorators, a DI está disponível apenas para controllers.

## Sumário

- [Começando](#começando)
- [Escrevendo services](#escrevendo-services)
  - [Inicialização assíncrona de service](#inicialização-assíncrona-de-service)
  - [Destruição elegante de services](#destruição-elegante-de-services)
- [Injetando em Controllers](#injetando-em-controllers)
  - [Tokens disponíveis](#tokens-disponíveis)
    - [Limitações](#limitações)
- [Inversão de dependência](#inversão-de-dependência)
- [Testes](#testes)
  - [Usando `configureControllerTest`](#usando-configurecontrollertest)
    - [Acessando a instância do controller](#acessando-a-instância-do-controller)
  - [Usando `configureServiceTest`](#usando-configureservicetest)
    - [Testando service síncrono](#testando-service-síncrono)
    - [Testando service assíncrono](#testando-service-assíncrono)

## Começando

Existem alguns passos simples para habilitar esta biblioteca:

1. Instale `@fastify-decorators/simple-di`
2. Habilite `"experimentalDecorators"` e `"emitDecoratorMetadata"` no `tsconfig.json`

_Nota_: metadados de tipo gerados automaticamente podem ter problemas com referências circulares ou forward references.

## Escrevendo services

O decorator `Service` é usado para tornar uma classe injetável.

_my-service.ts_:

```ts
import { Service } from "@fastify-decorators/simple-di";

@Service()
export class MyService {
  calculate() {
    doSomething();
  }
}
```

### Inicialização assíncrona de service

É possível que alguns services precisem de inicialização assíncrona, por exemplo, para configurar uma conexão com banco de dados.
Por esse motivo, a biblioteca fornece um decorator especial chamado `@Initializer`.

O uso é bem simples, basta anotar seu método assíncrono com ele:

_database.service.ts_:

```ts
import { Initializer, Service } from "@fastify-decorators/simple-di";
import { join } from "node:path";
import { DataSource } from "typeorm";
import { Message } from "../entity/message";

@Service()
export class ConnectionService {
  dataSource = new DataSource({
    type: "sqljs",
    autoSave: true,
    location: join(process.cwd(), "db", "database.db"),
    entities: [Message],
    logging: ["query", "schema"],
    synchronize: true,
  });

  @Initializer()
  async init(): Promise<void> {
    await this.dataSource.init();
  }
}
```

Services podem depender de outros services assíncronos para sua inicialização. Por esse motivo, `@Initializer` aceita um array desses services:

```ts
import { Initializer, Service } from "@fastify-decorators/simple-di";
import { Message } from "../entity/message";
import { ConnectionService } from "../services/connection.service";
import type { Repository } from "typeorm";

@Service()
export class MessageFacade {
  private repository!: Repository<Message>;
  constructor(private connectionService: ConnectionService) {}

  @Initializer([ConnectionService])
  async init(): Promise<void> {
    // como adicionamos DataSourceProvider como dependência, temos certeza de que foi
    // inicializado corretamente quando chegar neste ponto
    this.repository = this.connectionService.dataSource.getRepository(Message);
  }

  async getMessages(): Promise<Message[]> {
    return this.repository.find();
  }
}
```

### Destruição elegante de services

Se você precisa executar algo antes do service ser destruído (por exemplo, fechar conexão com banco de dados), você pode usar o decorator `@Destructor`:

```ts
import {
  Initializer,
  Destructor,
  Service,
} from "@fastify-decorators/simple-di";
import { Message } from "../entity/message";
import { DataSource } from "typeorm";

@Service()
export class ConnectionService {
  dataSource = new DataSource();

  @Initializer()
  async init(): Promise<void> {
    await this.dataSource.initialize();
  }

  @Destructor()
  async destroy(): Promise<void> {
    await this.dataSource.destroy();
  }
}
```

## Injetando em Controllers

A forma mais fácil de injetar dependências em controllers é usando construtores:

_sample.controller.ts_:

```ts
import { Controller, GET } from "fastify-decorators";
import { MyService } from "./my-service";

@Controller()
export class SampleController {
  constructor(private service: MyService) {}

  @GET()
  async index() {
    return this.service.doSomething();
  }
}
```

Outra opção para injetar dependências é o decorator `@Inject`:

_sample.controller.ts_:

```ts
import { Controller, GET } from "fastify-decorators";
import { Inject } from "@fastify-decorators/simple-di";
import { MyService } from "./my-service";

@Controller()
export class SampleController {
  @Inject(MyService)
  private service!: MyService;

  @GET()
  async index() {
    return this.service.doSomething();
  }
}
```

### Inject e tokens disponíveis

Quando você usa `@Inject`, precisa especificar um token. Mas o que é um token?
Token é um tipo de identificador da instância a ser injetada.

Por padrão, quando você usa o decorator `@Service`, ele usa o objeto da classe como token, mas isso pode ser alterado especificando o token explicitamente:

_my-service.ts_:

```ts
import { Service } from "@fastify-decorators/simple-di";

@Service("MyServiceToken")
class MyService {}
```

Dessa forma, o token de injeção de `MyService` será a string `MyServiceToken` e esse token pode ser usado de ambas as formas:

```ts
import { getInstanceByToken } from "@fastify-decorators/simple-di";
import { MyService } from "./my-service.ts";

const service = getInstanceByToken<MyService>("MyServiceToken");
```

### Tokens embutidos

| Token                  | Fornece           | Descrição                                     |
| ---------------------- | ----------------- | --------------------------------------------- |
| `FastifyInstanceToken` | `FastifyInstance` | Token usado para fornecer a `FastifyInstance` |

#### Limitações:

- Não é possível usar `getInstanceByToken` para obter `FastifyInstance` em campos estáticos ou opções de decorators:

  ```typescript
  import {
    Controller,
    FastifyInstanceToken,
    getInstanceByToken,
  } from "fastify-decorators";

  @Controller()
  class InstanceController {
    // Vai lançar um erro quando fizer bootstrap via lista de controllers
    // Isso acontece porque "FastifyInstance" não está disponível antes da chamada de "bootstrap",
    // mas é necessário quando o controller é importado
    static instance = getInstanceByToken(FastifyInstanceToken);
  }
  ```

## Inversão de dependência

A biblioteca também oferece a opção de definir o token na inicialização do Fastify para ter uma inicialização DI top-down:

_blog-service.ts_:

```typescript
export abstract class BlogService {
  abstract getBlogPosts(): Promise<Array<BlogPost>>;
}
```

_sqlite-blog-service.ts_:

```typescript
import { BlogService } from "./blog-service.js";
import { BlogPost } from "../models/blog-post.js";

@Service()
export class SqliteBlogService extends BlogService {
  async getBlogPosts(): Promise<Array<BlogPost>> {
    /* ... */
  }
}
```

_mysql-blog-service.ts_:

```typescript
import { BlogService } from "./blog-service.js";
import { BlogPost } from "../models/blog-post.js";

export class MySQLBlogService extends BlogService {
  async getBlogPosts(): Promise<Array<BlogPost>> {
    /* ... */
  }
}
```

_blog-controller.ts_:

```typescript
import { BlogService } from "../services/blog-service.js";

@Controller({
  route: "/api/blogposts",
})
export class BlogController {
  constructor(private blogService: BlogService) {}

  @GET()
  public async getBlogPosts(req, res): Promise<Array<BlogPosts>> {
    return this.blogService.getBlogPosts();
  }
}
```

E finalmente defina o token `BlogService` no `index.ts`:

```typescript
if (environment === "development") {
  injectables.injectService(BlogService, SqliteBlogService);
} else if (environment === "production") {
  injectables.injectSingleton(BlogService, new MySQLBlogService());
}

fastify.register(bootstrap, {
  /* ... */
});
```

## Testes

### Usando `configureControllerTest`

A função `configureControllerTest(options)` registra um Controller e permite que você faça mock dos Services para testar funcionalidades.
Você pode escrever testes validando comportamentos correspondentes ao resultado específico do Controller interagindo com services mockados.

_Nota_: se o mock não for fornecido para uma ou mais dependências, os originais serão usados.

_Uso_:

```ts
import { FastifyInstance } from "fastify";
import { configureControllerTest } from "@fastify-decorators/simple-di/testing";
import { AuthController } from "../src/auth.controller";
import { AuthService } from "../src/auth.service";

describe("Controller: AuthController", () => {
  let instance: FastifyInstance;
  const authService = { authorize: jest.fn() };

  beforeEach(async () => {
    instance = await configureControllerTest({
      controller: AuthController,
      mocks: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it(`deve responder com 'ok' se a autorização for bem-sucedida`, async () => {
    authService.authorize.and.returnValue(Promise.resolve(true));

    const result = await instance.inject({
      url: "/authorize",
      method: "POST",
      payload: { login: "test", password: "test" },
    });

    expect(result.json()).toEqual({ message: "ok" });
  });
});
```

#### Acessando a instância do controller

O `configureControllerTest` decora a instância do Fastify com a propriedade `controller` que pode ser usada para acessar a instância do controller.

_Nota_: o controller será `undefined` caso o tipo "per request" seja usado.

_Exemplo_:

```ts
import { FastifyInstance } from "fastify";
import {
  configureControllerTest,
  FastifyInstanceWithController,
} from "@fastify-decorators/simple-di/testing";
import { AuthController } from "../src/auth.controller";

describe("Controller: AuthController", () => {
  let instance: FastifyInstanceWithController<AuthController>;

  beforeEach(async () => {
    instance = await configureControllerTest({
      controller: AuthController,
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it(`deve responder com 'ok' se a autorização for bem-sucedida`, async () => {
    const controllerInstance = instance.controller;
    jest
      .spyOn(controllerInstance, "authorize")
      .mockReturnValue(Promise.resolve({ message: "ok" }));

    const result = await instance.inject({
      url: "/authorize",
      method: "POST",
      payload: { login: "test", password: "test" },
    });

    expect(result.json()).toEqual({ message: "ok" });
  });
});
```

### Usando `configureServiceTest`

O `configureServiceTest(options)` é bem parecido com `configureControllerTest`. A diferença é que este método retorna o service com dependências mockadas.

_Nota_: se o mock não for fornecido para uma ou mais dependências, os originais serão usados.

#### Testando service síncrono

Para services que não possuem método com decorator `@Initializer`, o `configureServiceTest` retornará uma instância dele.

_Uso_:

```ts
import { configureServiceTest } from "@fastify-decorators/simple-di/testing";
import { RolesService } from "../src/roles.service";
import { AuthService } from "../src/auth.service";

describe("Service: AuthService", () => {
  let service: AuthService;
  const rolesService = { isTechnical: jest.fn(), isAdmin: jest.fn() };

  beforeEach(() => {
    service = configureServiceTest({
      service: AuthService,
      mocks: [
        {
          provide: RolesService,
          useValue: rolesService,
        },
      ],
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it(`deve responder com 'ok' se a autorização for bem-sucedida`, async () => {
    rolesService.isTechnical.and.returnValue(true);
    rolesService.isAdmin.and.returnValue(false);
    const bearer =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6W119.0Dd6yUeJ4UbCr8WyXOiK3BhqVVwJFk5c53ipJBWenmc";

    const result = service.hasSufficientRole(bearer);

    expect(result).toBe(true);
  });
});
```

#### Testando service assíncrono

Se o service possui método com decorator `@Initializer`, então `configureServiceTest` retornará uma interseção de uma instância e Promise.
Você pode trabalhar com o service como se ele não tivesse `@Initializer`, a menos que você o aguarde (await).

```ts
import { configureServiceTest } from "@fastify-decorators/simple-di/testing";
import { RolesService } from "../src/roles.service";
import { AuthService } from "../src/auth.service";

describe("Service: AuthService", () => {
  let service: AuthService;
  const rolesService = { isTechnical: jest.fn(), isAdmin: jest.fn() };

  beforeEach(async () => {
    service = await configureServiceTest({
      service: AuthService,
      mocks: [
        {
          provide: RolesService,
          useValue: rolesService,
        },
      ],
    });
  });
  afterEach(() => jest.restoreAllMocks());

  it(`deve responder com 'ok' se a autorização for bem-sucedida`, async () => {
    rolesService.isTechnical.and.returnValue(true);
    rolesService.isAdmin.and.returnValue(false);
    const bearer =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6W119.0Dd6yUeJ4UbCr8WyXOiK3BhqVVwJFk5c53ipJBWenmc";

    const result = service.hasSufficientRole(bearer);

    expect(result).toBe(true);
  });
});
```
