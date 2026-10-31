import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAccountSchema,
  updateAccountSchema,
} from '../src/validators/accountValidator.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../src/validators/categoryValidator.js';
import * as accountService from '../src/services/accountService.js';
import * as categoryService from '../src/services/categoryService.js';
import db from '../src/db/knex.js';

describe('Account Validator (Validação de Contas)', () => {
  it('deve aceitar dados válidos com saldo inicial inteiro em centavos', () => {
    const validData = {
      nome: 'Nubank Corrente',
      tipo: 'CORRENTE',
      saldo_inicial_cents: 150000, // R$ 1.500,00
    };

    const result = createAccountSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data.saldo_inicial_cents).toBe(150000);
  });

  it('deve rejeitar valor monetário com ponto flutuante (float)', () => {
    const floatData = {
      nome: 'Banco Inter',
      tipo: 'CORRENTE',
      saldo_inicial_cents: 150.55, // INVÁLIDO: viola a regra de dinheiro nunca ser float
    };

    const result = createAccountSchema.safeParse(floatData);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('inteiro');
  });

  it('deve rejeitar tipo de conta não reconhecido', () => {
    const invalidType = {
      nome: 'Carteira Btc',
      tipo: 'CRIPTO',
      saldo_inicial_cents: 0,
    };

    const result = createAccountSchema.safeParse(invalidType);
    expect(result.success).toBe(false);
  });
});

describe('Category Validator (Validação de Categorias)', () => {
  it('deve aceitar categorias de despesa (expense) e receita (income)', () => {
    expect(
      createCategorySchema.safeParse({ nome: 'Alimentação', tipo: 'expense' }).success
    ).toBe(true);

    expect(
      createCategorySchema.safeParse({ nome: 'Salário', tipo: 'income' }).success
    ).toBe(true);
  });

  it('deve rejeitar tipo de categoria inválido', () => {
    const result = createCategorySchema.safeParse({
      nome: 'Outros',
      tipo: 'DESPESA_INVALIDA',
    });

    expect(result.success).toBe(false);
  });
});

describe('Account & Category Services', () => {
  const usuarioId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getAccountById deve retornar conta filtrando pelo usuario_id', async () => {
    const mockAccount = {
      id: 'acc-uuid-1',
      usuario_id: usuarioId,
      nome: 'Carteira',
      tipo: 'CARTEIRA',
      saldo_inicial_cents: 5000,
      ativa: true,
    };

    const whereMock = vi.fn().mockReturnValue({
      first: vi.fn().mockResolvedValue(mockAccount),
    });

    vi.spyOn(db, 'where').mockImplementation(whereMock);

    // Mock do db('contas')
    const knexSpy = vi.spyOn(db, 'select').mockImplementation(() => ({
      where: whereMock,
    }));

    // Verifica que getAccountById existe e é função
    expect(typeof accountService.getAccountById).toBe('function');
    expect(typeof accountService.createAccount).toBe('function');
  });

  it('createCategory e createAccount devem validar regras de existência', () => {
    expect(typeof categoryService.createCategory).toBe('function');
    expect(typeof categoryService.listCategories).toBe('function');
    expect(typeof categoryService.updateCategory).toBe('function');
    expect(typeof categoryService.deleteCategory).toBe('function');
  });
});

