<h1 style="text-align: center">@fastify-decorators/typedi</h1>

[![npm version](https://badge.fury.io/js/@fastify-decorators%2Ftypedi.svg)](https://badge.fury.io/js/@fastify-decorators%2Ftypedi)
[![npm](https://img.shields.io/npm/dm/@fastify-decorators/typedi.svg?colorB=brightgreen)](https://www.npmjs.com/package/@fastify-decorators/typedi)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

## Injeção de Dependência

Injeção de dependência (DI) é um mecanismo amplamente utilizado para conectar automaticamente dependências de controllers/services.
No fastify-decorators, a DI está disponível apenas para controllers.

Este plugin fornece suporte para integração com [TypeDI](https://npmjs.com/package/typedi).

### Começando

1. Instale `@fastify-decorators/typedi` e `typedi`
2. Use o container do TypeDI na aplicação:

   ```typescript
   import { useContainer } from "@fastify-decorators/typedi";
   import { fastify } from "fastify";
   import { bootstrap } from "fastify-decorators";
   import { Container } from "typedi";

   useContainer(Container);

   export const app = fastify();

   app.register(bootstrap, {
     directory: import.meta.url,
   });
   ```

3. Escreva os services, anote-os com `@Service` e injete nos controllers usando `@Inject` do TypeDI

### Exemplos

- [Exemplo 1](https://github.com/L2jLiga/fastify-decorators/tree/v4/examples/typedi)
