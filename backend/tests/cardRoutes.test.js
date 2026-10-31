import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as cardService from '../src/services/cardService.js';
import * as invoiceService from '../src/services/invoiceService.js';
import { generateToken } from '../src/services/authService.js';

describe('Rotas de Cartões (/cards)', () => {
  const usuarioId = '123e4567-e89b-12d3-a456-426614174000';
  let token;

  beforeEach(() => {
    vi.restoreAllMocks();
    token = generateToken({ userId: usuarioId, email: 'teste@exemplo.com' });
  });

  describe('Autenticação Obrigatória', () => {
    it('deve rejeitar acesso sem token com 401', async () => {
      const response = await request(app).get('/cards');
      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /cards', () => {
    it('deve rejeitar cartão com limite float com status 400', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Nubank',
          tipo: 'CREDITO',
          limite_cents: 1500.5, // float proibido
          dia_fechamento: 25,
          dia_vencimento: 5,
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve rejeitar cartão de débito sem conta_id associada com status 400', async () => {
      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Débito Inter',
          tipo: 'DEBITO',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve criar cartão de crédito com sucesso (201)', async () => {
      const mockCreated = {
        id: 'card-1',
        usuario_id: usuarioId,
        nome: 'Nubank Ultravioleta',
        tipo: 'CREDITO',
        limite_cents: 1000000,
        dia_fechamento: 20,
        dia_vencimento: 28,
        ativo: true,
      };

      vi.spyOn(cardService, 'createCard').mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/cards')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Nubank Ultravioleta',
          tipo: 'CREDITO',
          limite_cents: 1000000,
          dia_fechamento: 20,
          dia_vencimento: 28,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCreated);
    });
  });

  describe('GET /cards e Faturas', () => {
    it('GET /cards deve listar cartões do usuário', async () => {
      const mockCards = [
        { id: '1', usuario_id: usuarioId, nome: 'Nubank', tipo: 'CREDITO', ativo: true },
      ];

      vi.spyOn(cardService, 'listCards').mockResolvedValue(mockCards);

      const response = await request(app)
        .get('/cards')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCards);
    });

    it('GET /cards/:id/invoices deve listar faturas se o cartão for de crédito', async () => {
      const mockCard = {
        id: 'card-cred-1',
        usuario_id: usuarioId,
        tipo: 'CREDITO',
      };
      const mockInvoices = [
        { id: 'inv-1', cartao_id: 'card-cred-1', mes_referencia: '2026-11', status: 'ABERTA' },
      ];

      vi.spyOn(cardService, 'getCardById').mockResolvedValue(mockCard);
      vi.spyOn(invoiceService, 'listInvoicesByCard').mockResolvedValue(mockInvoices);

      const response = await request(app)
        .get('/cards/card-cred-1/invoices')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInvoices);
    });

    it('GET /cards/:id/invoices deve rejeitar pedido com 400 se cartão for de débito', async () => {
      const mockDebitCard = {
        id: 'card-deb-1',
        usuario_id: usuarioId,
        tipo: 'DEBITO',
      };

      vi.spyOn(cardService, 'getCardById').mockResolvedValue(mockDebitCard);

      const response = await request(app)
        .get('/cards/card-deb-1/invoices')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_CARD_TYPE');
    });

    it('DELETE /cards/:id deve desativar o cartão', async () => {
      vi.spyOn(cardService, 'deleteCard').mockResolvedValue({ id: 'card-1', ativo: false });

      const response = await request(app)
        .delete('/cards/card-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});

