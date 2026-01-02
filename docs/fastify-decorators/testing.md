# Fastify Decorators - Testes

---

## Sumário

- [Configurando framework de testes](#configurando-framework-de-testes)
  - [Jest](#jest--27)
  - [Mocha](#mocha)
- [Bootstrap do servidor completo](#bootstrap-do-servidor-completo)

---

## Configurando framework de testes

### Jest <= 26

Não suportado.

### Jest >= 27

**Pacotes a serem instalados:**

- [@types/jest](https://www.npmjs.com/package/@types/jest)
- [jest](https://www.npmjs.com/package/jest)
- [jest-resolve](https://www.npmjs.com/package/jest-resolve)
- [jest-ts-webcompat-resolver](https://www.npmjs.com/package/jest-ts-webcompat-resolver)
- [ts-jest](https://www.npmjs.com/package/ts-jest)
- [cross-env](https://www.npmjs.com/package/cross-env)

**Passos de configuração:**

1. Defina o type como module e habilite experimental VM modules no `package.json`
2. Defina o preset ESM do ts-jest na configuração do Jest
3. Defina jest-ts-webcompat-resolver como resolver

**Exemplo de configuração:**

**package.json:**

```json
{
  "type": "module",
  "scripts": {
    "test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest"
  }
}
```

**jest.config.js:**

```javascript
export default {
  preset: "ts-jest/presets/default-esm",
  // Nota: resolver necessário apenas quando usando imports com extensões
  resolver: "jest-ts-webcompat-resolver",
};
```

---

### Mocha

**Pacotes a serem instalados:**

- [@types/mocha](https://www.npmjs.com/package/@types/mocha)
- [mocha](https://www.npmjs.com/package/mocha)
- [ts-node](https://www.npmjs.com/package/ts-node)

**Exemplo de configuração:**

**.mocharc.yml:**

```yaml
# Opções comuns do Mocha
bail: false
timeout: 10000
enable-source-maps: true
v8-stack-trace-limit: 100
extension:
  - "ts"

# Habilita loader ESM experimental do TS
loader:
  - ts-node/esm

# Especifica padrão dos testes
spec:
  - test/**/*.test.ts
  - test/**/*.spec.ts
```

---

## Bootstrap do servidor completo

Também é possível testar a aplicação fazendo bootstrap de tudo. É comparável a uma execução normal. A diferença é que o servidor não irá rodar.

**Nota:** leia mais na [documentação de testes do Fastify](https://github.com/fastify/fastify/blob/master/docs/Testing.md).

**Exemplo:**

**src/index.ts:**

```ts
import fastify from "fastify";

const instance = fastify({
  /* opções */
});

/* seu código */

export { instance };
```

**test/auth.spec.ts:**

```ts
import { instance } from "../src";

describe("Application: autorização", () => {
  beforeEach(() => {
    /* Lógica de setup para o teste */
  });

  afterEach(() => {
    /* Lógica de teardown para o teste */
  });

  it("deve verificar credenciais e responder com resultado", async () => {
    const payload = { login: "test", password: "test" };

    const result = await instance.inject({
      url: "/auth/authorize",
      method: "POST",
      payload,
    });

    expect(JSON.parse(result.body)).toEqual({ message: "ok" });
  });
});
```
