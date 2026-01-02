import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserInMemoryRepository from '@application/repositories/users/user-in-memory.repository';

import GetUsersUseCase from './get-users.use-case';

let userInMemoryRepository: UserInMemoryRepository;
let sut: GetUsersUseCase;

describe('Get Users Use Case', () => {
  beforeEach(() => {
    userInMemoryRepository = new UserInMemoryRepository();
    sut = new GetUsersUseCase(userInMemoryRepository);
  });

  it('deve retornar lista vazia quando não houver usuários', async () => {
    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toHaveLength(0);
    }
  });

  it('deve retornar lista de usuários quando existirem', async () => {
    await userInMemoryRepository.create({
      name: 'João Silva',
      email: 'joao@example.com',
    });
    await userInMemoryRepository.create({
      name: 'Maria Santos',
      email: 'maria@example.com',
    });

    const result = await sut.execute();

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value).toHaveLength(2);
      expect(result.value[0].name).toBe('João Silva');
      expect(result.value[1].name).toBe('Maria Santos');
    }
  });

  it('deve retornar erro GET_USERS_ERROR quando houver falha', async () => {
    vi.spyOn(userInMemoryRepository, 'findAll').mockRejectedValueOnce(
      new Error('Database error'),
    );

    const result = await sut.execute();

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.code).toBe(500);
      expect(result.value.cause).toBe('GET_USERS_ERROR');
    }
  });
});
