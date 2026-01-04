import { hash } from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserInMemoryRepository from '@application/repositories/users/user-in-memory.repository';

import SignInUseCase from './sign-in.use-case';

let userInMemoryRepository: UserInMemoryRepository;
let sut: SignInUseCase;

describe('Sign In Use Case', () => {
  beforeEach(() => {
    userInMemoryRepository = new UserInMemoryRepository();
    sut = new SignInUseCase(userInMemoryRepository);
  });

  it('deve autenticar usuário com credenciais válidas', async () => {
    const passwordHash = await hash('senha123', 12);

    await userInMemoryRepository.create({
      name: 'Matheus Silva',
      email: 'matheus@example.com',
      password: passwordHash,
      role: 'OWNER',
    });

    const result = await sut.execute({
      email: 'matheus@example.com',
      password: 'senha123',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.email).toBe('matheus@example.com');
      expect(result.value.name).toBe('Matheus Silva');
    }
  });

  it('deve retornar 401 quando usuário não existe', async () => {
    const result = await sut.execute({
      email: 'naoexiste@example.com',
      password: 'senha123',
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.code).toBe(401);
    }
  });

  it('deve retornar 401 quando senha está incorreta', async () => {
    const passwordHash = await hash('senha123', 12);

    await userInMemoryRepository.create({
      name: 'Matheus Silva',
      email: 'matheus@example.com',
      password: passwordHash,
      role: 'OWNER',
    });

    const result = await sut.execute({
      email: 'matheus@example.com',
      password: 'senhaerrada',
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.code).toBe(401);
      expect(result.value.message).toBe('Invalid credentials');
    }
  });

  it('deve retornar erro SIGN_IN_ERROR quando houver falha', async () => {
    vi.spyOn(userInMemoryRepository, 'findBy').mockRejectedValueOnce(
      new Error('Database error'),
    );

    const result = await sut.execute({
      email: 'matheus@example.com',
      password: 'senha123',
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.code).toBe(500);
      expect(result.value.cause).toBe('SIGN_IN_ERROR');
    }
  });
});
