import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as reportService from '../src/services/reportService.js';
import { generateToken } from '../src/services/authService.js';

describe('Rotas de Relatórios (/reports)', () => {
  const usuarioId = '123e4567-e89b-12d3-a456-426614174000';
  let token;

  beforeEach(() => {
    vi.restoreAllMocks();
    token = generateToken({ userId: usuarioId, email: 'teste@exemplo.com' });
  });

  describe('Autenticação Obrigatória', () => {
    it('deve rejeitar acesso sem token com 401', async () => {
      const response = await request(app).get('/reports/balances');
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /reports/balances', () => {
    it('deve retornar a lista de saldos consolidados por conta com status 200', async () => {
      const mockBalances = [
        {
          id: 'acc-1',
          nome: 'Nubank',
          tipo: 'CORRENTE',
          saldo_inicial_cents: 100000,
          saldo_atual_cents: 145000,
        },
      ];

      vi.spyOn(reportService, 'getAccountBalances').mockResolvedValue(mockBalances);

      const response = await request(app)
        .get('/reports/balances')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBalances);
    });
  });

  describe('GET /reports/summary', () => {
    it('deve rejeitar formato de mês inválido com status 400', async () => {
      const response = await request(app)
        .get('/reports/summary?month=2026-99')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve retornar resumo mensal consolidado com status 200', async () => {
      const mockSummary = {
        mes_referencia: '2026-10',
        total_receitas_cents: 500000,
        total_despesas_cents: 220000,
        saldo_liquido_cents: 280000,
      };

      vi.spyOn(reportService, 'getMonthlySummary').mockResolvedValue(mockSummary);

      const response = await request(app)
        .get('/reports/summary?month=2026-10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSummary);
    });
  });

  describe('GET /reports/by-category', () => {
    it('deve retornar despesas por categoria com status 200', async () => {
      const mockExpenses = [
        { categoria_id: 'cat-1', categoria_nome: 'Alimentação', total_cents: 120000 },
        { categoria_id: 'cat-2', categoria_nome: 'Transporte', total_cents: 45000 },
      ];

      vi.spyOn(reportService, 'getExpensesByCategory').mockResolvedValue(mockExpenses);

      const response = await request(app)
        .get('/reports/by-category?month=2026-10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExpenses);
    });
  });
});

