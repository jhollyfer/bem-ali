import { injectablesHolder } from 'fastify-decorators';

import { UserContractRepository } from '@application/repositories/users/user-contract.repository';
import UserDrizzleRepository from '@application/repositories/users/user-drizzle.repository';

/**
 * Registro explícito de dependências.
 * Quando trocar de ORM, altere apenas os imports e registros aqui.
 */
export function registerDependencies(): void {
  injectablesHolder.injectService(
    UserContractRepository,
    UserDrizzleRepository,
  );
}
