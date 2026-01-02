# Fastify Decorators

**Framework voltado a fornecer decorators TypeScript úteis para implementar controllers, services e request handlers, construído com Fastify.**

---

## Benefícios

- **Compatível com Fastify** - Construído com Fastify e suporta todos os seus recursos e plugins
  - **Validação JSON Schema** - Crie JSON Schemas para validar e acelerar suas requisições e respostas
  - **Alta performance** - O framework adiciona o mínimo de overhead possível ao Fastify
- **Altamente customizável** - Crie seus controllers, services e métodos como desejar
- **100% TypeScript** - Escrito em TypeScript e inclui todas as tipagens necessárias
- **Plugins** - A biblioteca fornece APIs para estender sua funcionalidade
  - **Simple DI** - Fornece interface simples de Injeção de Dependência para vincular seus services
  - **TypeDI** - Fornece integração com TypeDI

---

## Documentação

- Primeiros passos
- Bootstrapping
- Controllers
- Request Handlers
- Testes
- Desenvolvimento de Plugins
- Guia de Migração (V4)

---

## Suporte às versões do Fastify

| Fastify Decorators |  Fastify  |
| :----------------: | :-------: |
|        1.x         |    2.x    |
|        2.x         |    2.x    |
|      < 3.12.x      |    3.x    |
|     >= 3.12.x      | 3.x & 4.x |
|        4.x         |    4.x    |

---

## Alternativas

- **NestJS** - Um framework Node.js progressivo para construir aplicações server-side eficientes, confiáveis e escaláveis.
- **Fastify Resty** - Framework de API REST moderno e declarativo para desenvolvimento backend super-rápido e simplificado, construído sobre Fastify e TypeScript.

---

## Primeiros Passos

Olá! Obrigado por conferir o fastify-decorators!

Este documento pretende ser uma introdução suave ao fastify-decorators e seus usos.

### Pré-requisitos

- TypeScript
- Fastify
- Tipagens para NodeJS (pacote `@types/node` instalado)

### Instalação

Instalar com npm:

```bash
npm i fastify-decorators --save
```

Instalar com yarn:

```bash
yarn add fastify-decorators
```

### Configuração adicional do TypeScript

Fastify-decorators requer que o recurso `experimentalDecorators` esteja habilitado. Para isso, você precisa atualizar seu config do TypeScript:

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

**Nota:** se você está em dúvida sobre qual `target` usar, consulte a tabela abaixo:

| Versão do Node | target |
| -------------- | ------ |
| 14.x           | es2020 |
| 16.x           | es2021 |
| 18.x           | es2022 |

O próprio `fastify-decorators` usa `"target": "es2018"` para suportar NodeJS 10+.

---

## Seu primeiro servidor

### Modo Request Handler

Vamos escrever seu primeiro servidor com request handler:

**Estrutura do projeto:**

```
 ├── index.ts
 ├── handlers
 │    └── first.handler.ts
 └── tsconfig.json
```

**index.ts:**

```ts
import { bootstrap } from "fastify-decorators";

// Importa o framework e instancia
const instance = require("fastify")();

// Registra auto-bootstrap dos handlers
instance.register(bootstrap, {
  // Especifica o diretório com nosso handler
  directory: new URL(`handlers`, import.meta.url),

  // Especifica máscara para corresponder apenas ao nosso handler
  mask: /\.handler\./,
});

// Roda o servidor!
instance.listen(3000);
```

**handlers/first.handler.ts:**

```ts
import { GET, RequestHandler } from "fastify-decorators";

@GET({
  url: "/hello",
})
export default class FirstHandler extends RequestHandler {
  async handle() {
    return "Olá mundo!";
  }
}
```

### Modo Controllers

fastify-decorators também fornece uma forma de construir controllers com múltiplos handlers:

**Estrutura do projeto:**

```
 ├── index.ts
 ├── controllers
 │    └── first.controller.ts
 └── tsconfig.json
```

**index.ts:**

```ts
import { bootstrap } from "fastify-decorators";

// Importa o framework e instancia
const instance = require("fastify")();

// Registra auto-bootstrap dos handlers
instance.register(bootstrap, {
  // Especifica o diretório com nossos controllers
  directory: new URL(`controllers`, import.meta.url),

  // Especifica máscara para corresponder apenas aos nossos controllers
  mask: /\.controller\./,
});

// Roda o servidor!
instance.listen(3000);
```

**controllers/first.controller.ts:**

```ts
import { Controller, GET } from "fastify-decorators";

@Controller({ route: "/" })
export default class FirstController {
  @GET({ url: "/hello" })
  async helloHandler() {
    return "Olá mundo!";
  }

  @GET({ url: "/goodbye" })
  async goodbyeHandler() {
    return "Tchau tchau!";
  }
}
```

Também precisamos habilitar o recurso `experimentalDecorators` no nosso config do TypeScript:

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

---

## Build e execução do servidor

Depois que todos os nossos arquivos estiverem prontos, precisamos fazer o build do servidor antes de executá-lo:

1. Adicione ao package.json o script para build:

   ```json
   "scripts": {
     "build": "tsc"
   }
   ```

2. Execute o script de build:

   Com npm:

   ```bash
   npm run build
   ```

   Com yarn:

   ```bash
   yarn build
   ```

3. Inicie o servidor:

   ```bash
   node index.js
   ```

Pronto, foi fácil!

---

## Licença

Este projeto está licenciado sob a Licença MIT.
