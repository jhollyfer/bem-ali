import { UserCreatePayload } from '@bem-ali/types';
import { hash } from 'bcryptjs';
import supertest from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { database } from '@database/index';
import { UserTable } from '@database/schema';
import { kernel } from '@start/kernel';

describe('E2E Sign In Controller', () => {
  beforeEach(async () => {
    await kernel.ready();
    await database.delete(UserTable);
  });

  afterAll(async () => {
    await kernel.close();
  });

  describe('POST /authentication/sign-in', () => {
    it('deve retornar 200 e setar cookies com credenciais válidas', async () => {
      const hashedPassword = await hash('senha123', 12);

      const user: UserCreatePayload = {
        name: 'Auth User',
        email: 'auth-user@example.com',
        password: hashedPassword,
        role: 'OWNER',
      };

      await database.insert(UserTable).values(user);

      const response = await supertest(kernel.server)
        .post('/authentication/sign-in')
        .send({
          email: 'auth-user@example.com',
          password: 'senha123',
        });

      expect(response.statusCode).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('deve retornar 401 quando usuário não existe', async () => {
      const response = await supertest(kernel.server)
        .post('/authentication/sign-in')
        .send({
          email: 'naoexiste@example.com',
          password: 'senha123',
        });

      expect(response.statusCode).toBe(401);
    });

    it('deve retornar 401 quando senha está incorreta', async () => {
      const hashedPassword = await hash('senha123', 12);

      const user: UserCreatePayload = {
        name: 'Auth User Wrong Pass',
        email: 'auth-wrong-pass@example.com',
        password: hashedPassword,
        role: 'OWNER',
      };

      await database.insert(UserTable).values(user);

      const response = await supertest(kernel.server)
        .post('/authentication/sign-in')
        .send({
          email: 'auth-wrong-pass@example.com',
          password: 'senhaerrada',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
