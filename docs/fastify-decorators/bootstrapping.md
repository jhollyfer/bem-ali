# Fastify Decorators - Bootstrapping

Bootstrapping é o processo de inicialização. Nesta etapa, a biblioteca inicializa todos os controllers, services e suas dependências. Essa inicialização é feita antes da instância do Fastify começar a escutar.

---

## Carregar automaticamente todos os controllers

Uma das opções para fazer o bootstrap da aplicação é o recurso de autoload, que usa path e mask para carregar controllers e/ou handlers.

**Exemplo:**

```typescript
import { fastify } from "fastify";
import { bootstrap } from "fastify-decorators";

const app = fastify();

app.register(bootstrap, {
  directory: import.meta.url,
  mask: /\.controller\./,
});
```

---

## Especificando lista de controllers

A segunda opção disponível é especificar todos os controllers e/ou handlers necessários via array. Dessa forma, você terá um controle mais granular sobre o que carregar.

**Exemplo:**

```typescript
import { fastify } from "fastify";
import { bootstrap } from "fastify-decorators";

// Com export default
import MyController from "./my-controller.js";

// Com export nomeado
import { SecondController } from "./second-controller.js";

const app = fastify();

app.register(bootstrap, {
  controllers: [MyController, SecondController],
});
```

---

## Usando um class loader customizado

Por padrão, fastify-decorators usa seu próprio mecanismo de DI para obter instâncias dos controllers. Esse mecanismo depende do `reflect-metadata` e fornece recursos básicos como injeção no construtor e injeção em campos da classe via decorators.

Você pode ler mais sobre o DI embutido em [Services e injeção de dependência](Services%20and%20dependency%20injection.md).

Caso o DI embutido não seja adequado, é possível escrever seu próprio loader customizado para classes e passá-lo via opção `classLoader`.

A assinatura é `(clazz: Constructor<C>) => C`.

**Exemplo:**

```typescript
import "reflect-metadata";
import { Container } from "typedi";

app.register(bootstrap, {
  // ...outras opções...
  classLoader(clazz) {
    return Container.get(clazz);
  },
});
```
