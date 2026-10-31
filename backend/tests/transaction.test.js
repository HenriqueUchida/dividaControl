import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  transferSchema,
} from '../src/validators/transactionValidator.js';
import * as transactionService from '../src/services/transactionService.js';

describe('Transaction Validator (Validações de Transações)', () => {
  const validPayload = {
    descricao: 'Supermercado Mensal',
    amount_cents: 35000, // R$ 350,00
    type: 'expense',
    date: '2026-10-31',
    status: 'pago',
    categoria_id: '123e4567-e89b-12d3-a456-426614174000',
    conta_id: '123e4567-e89b-12d3-a456-426614174001',
  };

  it('deve validar transação com dados corretos e valor inteiro em centavos', () => {
    const result = createTransactionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar transação com valor monetário float', () => {
    const floatPayload = {
      ...validPayload,
      amount_cents: 350.5, // float proibido
    };

    const result = createTransactionSchema.safeParse(floatPayload);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('inteiro');
  });

  it('deve rejeitar transação com valor menor ou igual a zero', () => {
    const zeroPayload = { ...validPayload, amount_cents: 0 };
    const negativePayload = { ...validPayload, amount_cents: -500 };

    expect(createTransactionSchema.safeParse(zeroPayload).success).toBe(false);
    expect(createTransactionSchema.safeParse(negativePayload).success).toBe(false);
  });

  it('deve rejeitar formato de data incorreto', () => {
    const badDate = { ...validPayload, date: '31/10/2026' };
    const result = createTransactionSchema.safeParse(badDate);

    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('AAAA-MM-DD');
  });

  it('deve exigir pelo menos conta_id ou cartao_id', () => {
    const noOrigin = {
      descricao: 'Gasto Fantasma',
      amount_cents: 5000,
      type: 'expense',
      date: '2026-10-31',
      categoria_id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = createTransactionSchema.safeParse(noOrigin);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('conta bancária ou a um cartão');
  });
});

describe('Transfer Validator (Validações de Transferência)', () => {
  it('deve validar transferência com contas distintas e valor inteiro positivo', () => {
    const validTransfer = {
      conta_origem_id: '123e4567-e89b-12d3-a456-426614174000',
      conta_destino_id: '123e4567-e89b-12d3-a456-426614174001',
      amount_cents: 20000,
      date: '2026-10-31',
      descricao: 'Reserva de Emergência',
    };

    const result = transferSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar transferência se a conta de origem for a mesma de destino', () => {
    const sameAccount = {
      conta_origem_id: '123e4567-e89b-12d3-a456-426614174000',
      conta_destino_id: '123e4567-e89b-12d3-a456-426614174000',
      amount_cents: 10000,
      date: '2026-10-31',
    };

    const result = transferSchema.safeParse(sameAccount);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('origem e destino não podem ser iguais');
  });

  it('deve rejeitar transferência com valor float', () => {
    const floatTransfer = {
      conta_origem_id: '123e4567-e89b-12d3-a456-426614174000',
      conta_destino_id: '123e4567-e89b-12d3-a456-426614174001',
      amount_cents: 100.99,
      date: '2026-10-31',
    };

    const result = transferSchema.safeParse(floatTransfer);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('inteiro');
  });
});

describe('Transaction Service Definitions', () => {
  it('deve exportar as operações principais de transação e transferência', () => {
    expect(typeof transactionService.listTransactions).toBe('function');
    expect(typeof transactionService.createTransaction).toBe('function');
    expect(typeof transactionService.createTransfer).toBe('function');
    expect(typeof transactionService.deleteTransaction).toBe('function');
  });
});

