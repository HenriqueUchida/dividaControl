import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as accountService from '../src/services/accountService.js';
import * as categoryService from '../src/services/categoryService.js';
import { generateToken } from '../src/services/authService.js';

describe('Rotas de Contas (/accounts) e Categorias (/categories)', () => {
  const usuarioId = '123e4567-e89b-12d3-a456-426614174000';
  let token;

  beforeEach(() => {
    vi.restoreAllMocks();
    token = generateToken({ userId: usuarioId, email: 'teste@exemplo.com' });
  });

  describe('Autenticação Obrigatória', () => {
    it('deve rejeitar acesso a /accounts sem token com status 401', async () => {
      const response = await request(app).get('/accounts');
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('deve rejeitar acesso a /categories sem token com status 401', async () => {
      const response = await request(app).get('/categories');
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Rotas /accounts', () => {
    it('GET /accounts deve listar contas do usuário', async () => {
      const mockAccounts = [
        { id: '1', usuario_id: usuarioId, nome: 'Nubank', tipo: 'CORRENTE', saldo_inicial_cents: 10000, ativa: true },
      ];

      vi.spyOn(accountService, 'listAccounts').mockResolvedValue(mockAccounts);

      const response = await request(app)
        .get('/accounts')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAccounts);
    });

    it('POST /accounts deve rejeitar valores decimais/float em saldo_inicial_cents com 400', async () => {
      const response = await request(app)
        .post('/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Banco Inter',
          tipo: 'CORRENTE',
          saldo_inicial_cents: 125.75, // float proibido
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /accounts deve criar conta com sucesso (201)', async () => {
      const mockCreated = {
        id: 'new-acc-uuid',
        usuario_id: usuarioId,
        nome: 'Banco Inter',
        tipo: 'CORRENTE',
        saldo_inicial_cents: 12575,
        ativa: true,
      };

      vi.spyOn(accountService, 'createAccount').mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Banco Inter',
          tipo: 'CORRENTE',
          saldo_inicial_cents: 12575,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreated);
    });

    it('DELETE /accounts/:id deve desativar a conta', async () => {
      vi.spyOn(accountService, 'deleteAccount').mockResolvedValue({ id: 'acc-1', ativa: false });

      const response = await request(app)
        .delete('/accounts/acc-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Rotas /categories', () => {
    it('GET /categories deve listar categorias', async () => {
      const mockCategories = [
        { id: '1', usuario_id: usuarioId, nome: 'Alimentação', tipo: 'expense', ativa: true },
      ];

      vi.spyOn(categoryService, 'listCategories').mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/categories?tipo=expense')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
    });

    it('POST /categories deve criar categoria com sucesso (201)', async () => {
      const mockCreated = {
        id: 'cat-uuid',
        usuario_id: usuarioId,
        nome: 'Salário',
        tipo: 'income',
        ativa: true,
      };

      vi.spyOn(categoryService, 'createCategory').mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Salário',
          tipo: 'income',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreated);
    });

    it('POST /categories deve rejeitar tipo inválido com 400', async () => {
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Investimento',
          tipo: 'tipo-invalido',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /categories/seed-defaults deve gerar categorias padrão com sucesso', async () => {
      const mockSeeded = [
        { id: '1', nome: 'Alimentação', tipo: 'expense' },
        { id: '2', nome: 'Salário', tipo: 'income' },
      ];

      vi.spyOn(categoryService, 'seedDefaultCategories').mockResolvedValue(mockSeeded);

      const response = await request(app)
        .post('/categories/seed-defaults')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.categories).toEqual(mockSeeded);
    });
  });
});

