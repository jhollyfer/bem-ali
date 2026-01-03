import { hash } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserInMemoryRepository from '@application/repositories/users/user-in-memory.repository';

import UsersFindManyUseCase from './find-many.use-case';

let userInMemoryRepository: UserInMemoryRepository;
let sut: UsersFindManyUseCase;

describe('Get Users Use Case', () => {
  beforeEach(() => {
    userInMemoryRepository = new UserInMemoryRepository();
    sut = new UsersFindManyUseCase(userInMemoryRepository);
  });

  it('deve retornar lista vazia quando não houver usuários', async () => {
    const result = await sut.execute({
      page: 1,
      per_page: 20,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toHaveLength(0);
    }
  });

  it('deve retornar lista de usuários quando existirem', async () => {
    const passwordHash = await hash('senha123', 12);

    for await (const [index] of Array.from({ length: 20 }).entries()) {
      await userInMemoryRepository.create({
        name: 'Matheus Silva '.concat((index + 1).toString()),
        email: 'matheus'.concat((index + 1).toString()).concat('@example.com'),
        password: passwordHash,
        role: index % 2 === 0 ? 'OWNER' : 'CUSTOMER',
      });
    }

    const result = await sut.execute({
      page: 1,
      per_page: 20,
    });

    expect(result.isRight()).toBe(true);

    if (result.isRight()) {
      expect(result.value).toHaveLength(20);
      expect(result.value[0].name).toBe('Matheus Silva 1');
      expect(result.value[1].name).toBe('Matheus Silva 2');
      expect(result.value[19].name).toBe('Matheus Silva 20');
    }
  });

  it('deve retornar erro GET_USERS_ERROR quando houver falha', async () => {
    vi.spyOn(userInMemoryRepository, 'findMany').mockRejectedValueOnce(
      new Error('Database error'),
    );

    const result = await sut.execute({
      page: 1,
      per_page: 20,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.code).toBe(500);
      expect(result.value.cause).toBe('GET_USERS_ERROR');
    }
  });
});
