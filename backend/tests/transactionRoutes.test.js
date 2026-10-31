import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as transactionService from '../src/services/transactionService.js';
import { generateToken } from '../src/services/authService.js';

describe('Rotas de Transações (/transactions)', () => {
  const usuarioId = '123e4567-e89b-12d3-a456-426614174000';
  let token;

  beforeEach(() => {
    vi.restoreAllMocks();
    token = generateToken({ userId: usuarioId, email: 'teste@exemplo.com' });
  });

  describe('Autenticação Obrigatória', () => {
    it('deve rejeitar acesso sem token com 401', async () => {
      const response = await request(app).get('/transactions');
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /transactions', () => {
    it('deve rejeitar transação com valor float com 400', async () => {
      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          descricao: 'Padaria',
          amount_cents: 12.5, // float proibido
          type: 'expense',
          date: '2026-10-31',
          categoria_id: '123e4567-e89b-12d3-a456-426614174001',
          conta_id: '123e4567-e89b-12d3-a456-426614174002',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve criar transação com sucesso (201)', async () => {
      const mockCreated = {
        id: 'tx-1',
        usuario_id: usuarioId,
        descricao: 'Almoço',
        amount_cents: 4500,
        type: 'expense',
        date: '2026-10-31',
        status: 'pago',
      };

      vi.spyOn(transactionService, 'createTransaction').mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          descricao: 'Almoço',
          amount_cents: 4500,
          type: 'expense',
          date: '2026-10-31',
          categoria_id: '123e4567-e89b-12d3-a456-426614174001',
          conta_id: '123e4567-e89b-12d3-a456-426614174002',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreated);
    });
  });

  describe('POST /transactions/transfer (Transferência)', () => {
    it('deve rejeitar transferência com mesma conta de origem e destino', async () => {
      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conta_origem_id: '123e4567-e89b-12d3-a456-426614174001',
          conta_destino_id: '123e4567-e89b-12d3-a456-426614174001',
          amount_cents: 10000,
          date: '2026-10-31',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve criar transferência atômica com sucesso (201)', async () => {
      const mockTransferResult = {
        saida: { id: 'tx-saida', amount_cents: 10000, type: 'expense' },
        entrada: { id: 'tx-entrada', amount_cents: 10000, type: 'income' },
      };

      vi.spyOn(transactionService, 'createTransfer').mockResolvedValue(mockTransferResult);

      const response = await request(app)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conta_origem_id: '123e4567-e89b-12d3-a456-426614174001',
          conta_destino_id: '123e4567-e89b-12d3-a456-426614174002',
          amount_cents: 10000,
          date: '2026-10-31',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTransferResult);
    });
  });

  describe('GET e DELETE /transactions', () => {
    it('GET /transactions deve retornar extrato de transações com filtros', async () => {
      const mockList = [
        { id: 'tx-1', descricao: 'Salário', amount_cents: 500000, type: 'income' },
      ];

      vi.spyOn(transactionService, 'listTransactions').mockResolvedValue(mockList);

      const response = await request(app)
        .get('/transactions?startDate=2026-10-01&endDate=2026-10-31')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockList);
    });

    it('DELETE /transactions/:id deve excluir transação com sucesso', async () => {
      vi.spyOn(transactionService, 'deleteTransaction').mockResolvedValue();

      const response = await request(app)
        .delete('/transactions/tx-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

