# Fastify Decorators - Plugins

Plugins são a forma de estender a funcionalidade do Fastify e do Fastify Decorators.

---

## Desenvolvimento de Plugins

### API de Plugins

A API de Plugins é exportada através do entrypoint "fastify-decorators/plugins". Ela inclui símbolos e funções comuns.

---

### Ciclo de Vida do Fastify Decorators

Fastify Decorators fornece vários hooks:

- `appInit` - executa após a instância do Fastify ser criada, mas antes do Fastify Decorators iniciar a inicialização
- `beforeControllerCreation` - executa para cada Controller/RequestHandler antes da instância ser criada
- `afterControllerCreation` - executa para cada Controller/RequestHandler após a instância ser criada
- `appReady` - executa quando o Fastify Decorators termina a inicialização
- `appDestroy` - executa antes da instância do Fastify ser destruída

---

### Class Loader

"Class loader" é uma função usada para instanciar Controller/RequestHandler/Service/etc.

Ela aceita a própria classe e o escopo, onde:

- **classe** pode ser Controller/RequestHandler ou qualquer outro tipo de classe definido no plugin (ex: Service)
- **escopo** é onde essa classe foi solicitada - FastifyInstance ou FastifyRequest

O registro do class loader DEVE ser feito na etapa `appInit` decorando a FastifyInstance.

**Exemplo:**

```typescript
import {
  CLASS_LOADER,
  createInitializationHook,
} from "fastify-decorators/plugins";

createInitializationHook("appInit", (fastify) => {
  fastify.decorate(CLASS_LOADER, (clazz: new () => any, _scope) => new clazz());
});
```

---

### Handlers, Hooks e Error Handlers

Além dos hooks normais do Ciclo de Vida, Fastify Decorators fornece interfaces e símbolos para interagir com handlers e hooks registrados.

Essa funcionalidade pode ser usada para decorar métodos implicitamente.

**Exemplo: logar argumentos quando qualquer hook é chamado:**

```typescript
import { FastifyInstance } from "fastify";
import {
  createInitializationHook,
  Registrable,
  hasHooks,
  HOOKS,
  IHook,
} from "fastify-decorators/plugins";

createInitializationHook(
  "beforeControllerCreation",
  (fastifyInstance: FastifyInstance, target: Registrable) => {
    if (hasHooks(target)) {
      for (const hook of target[HOOKS]) {
        // hook tem o tipo IHook
        const _method = target[hook.handlerName];

        target[hook.handlerName] = function logged(...args: any) {
          console.log("Hook chamado com args: ", args);
          return _method.apply(this, args);
        };
      }
    }
  }
);
```

---

### Ciclo de Vida do Fastify

Por favor, consulte a [documentação do Fastify](https://fastify.dev/docs/latest/Reference/Lifecycle).
