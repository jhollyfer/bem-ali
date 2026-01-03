import { UserCreatePayload } from '@bem-ali/types';
import { hash } from 'bcryptjs';
import supertest from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { database } from '@database/index';
import { UserTable } from '@database/schema';
import { kernel } from '@start/kernel';

describe('E2E Get Users Controller', () => {
  beforeEach(async () => {
    await kernel.ready();
    // Limpar dados antes de cada teste
    await database.delete(UserTable);
  });

  afterAll(async () => {
    await kernel.close();
  });

  describe('GET /users', () => {
    it('deve retornar 200 e lista vazia quando não há usuários', async () => {
      const response = await supertest(kernel.server).get('/users');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('deve retornar 200 e lista de usuários com estrutura correta', async () => {
      const hashedPassword = await hash('senha123', 12);

      const values: UserCreatePayload[] = [
        {
          name: 'Pedro Silva',
          email: 'pedro@example.com',
          password: hashedPassword,
          role: 'OWNER',
        },
        {
          name: 'Maria Santos',
          email: 'maria@example.com',
          password: hashedPassword,
          role: 'CUSTOMER',
        },
      ];

      await database.insert(UserTable).values(values);

      const response = await supertest(kernel.server).get('/users');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);

      const user = response.body[0];

      expect(user).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it('deve retornar usuários com dados específicos inseridos', async () => {
      const hashedPassword = await hash('senha123', 12);

      const created: UserCreatePayload = {
        name: 'Pedro Costa',
        email: 'pedro@example.com',
        password: hashedPassword,
        role: 'OWNER',
      };

      await database.insert(UserTable).values(created);

      const response = await supertest(kernel.server).get('/users');

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const user = response.body.find(
        (_user: { email: string }) => _user.email === created.email,
      );
      expect(user).toBeDefined();
      expect(user.name).toBe(created.name);
      expect(user.email).toBe(created.email);
    });
  });
});
