import { describe, it, expect } from 'vitest';
import { createCardSchema } from '../src/validators/cardValidator.js';
import { calculateInvoiceDates } from '../src/services/invoiceService.js';

describe('Card Validator (Validações de Cartão)', () => {
  it('deve validar cartão de crédito válido com limite em centavos inteiros', () => {
    const validCreditCard = {
      nome: 'Nubank Platinum',
      tipo: 'CREDITO',
      bandeira: 'Mastercard',
      limite_cents: 500000, // R$ 5.000,00
      dia_fechamento: 25,
      dia_vencimento: 5,
    };

    const result = createCardSchema.safeParse(validCreditCard);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar cartão de crédito com limite em float', () => {
    const floatLimitCard = {
      nome: 'Nubank Platinum',
      tipo: 'CREDITO',
      limite_cents: 5000.5, // float proibido
      dia_fechamento: 25,
      dia_vencimento: 5,
    };

    const result = createCardSchema.safeParse(floatLimitCard);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('inteiro');
  });

  it('deve rejeitar cartão de crédito sem dia_fechamento ou dia_vencimento', () => {
    const missingDays = {
      nome: 'Cartão Sem Ciclo',
      tipo: 'CREDITO',
      limite_cents: 300000,
    };

    const result = createCardSchema.safeParse(missingDays);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar cartão de débito sem conta_id associada', () => {
    const debitWithoutAccount = {
      nome: 'Débito Nubank',
      tipo: 'DEBITO',
    };

    const result = createCardSchema.safeParse(debitWithoutAccount);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].message).toContain('conta bancária');
  });

  it('deve aceitar cartão de débito com conta_id válida', () => {
    const validDebit = {
      nome: 'Débito Nubank',
      tipo: 'DEBITO',
      conta_id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const result = createCardSchema.safeParse(validDebit);
    expect(result.success).toBe(true);
  });
});

describe('Invoice Service (Cálculo de Ciclos de Fatura)', () => {
  it('deve calcular ciclo no mesmo mês se compra for antes ou no dia do fechamento', () => {
    // Compra em 2026-10-15 com fechamento no dia 25 e vencimento no dia 5 do mês seguinte
    const dataCompra = '2026-10-15T12:00:00Z';
    const ciclo = calculateInvoiceDates(25, 5, dataCompra);

    expect(ciclo.dataFechamento).toBe('2026-10-25');
    expect(ciclo.dataVencimento).toBe('2026-11-05');
    expect(ciclo.mesReferencia).toBe('2026-11');
  });

  it('deve avançar ciclo para o próximo mês se compra for após o fechamento', () => {
    // Compra em 2026-10-28 com fechamento no dia 25
    const dataCompra = '2026-10-28T12:00:00Z';
    const ciclo = calculateInvoiceDates(25, 5, dataCompra);

    expect(ciclo.dataFechamento).toBe('2026-11-25');
    expect(ciclo.dataVencimento).toBe('2026-12-05');
    expect(ciclo.mesReferencia).toBe('2026-12');
  });

  it('deve tratar a virada de ano corretamente (Dezembro para Janeiro)', () => {
    // Compra em 2026-12-28 com fechamento no dia 20 e vencimento no dia 28
    const dataCompra = '2026-12-28T12:00:00Z';
    const ciclo = calculateInvoiceDates(20, 28, dataCompra);

    expect(ciclo.dataFechamento).toBe('2027-01-20');
    expect(ciclo.dataVencimento).toBe('2027-01-28');
    expect(ciclo.mesReferencia).toBe('2027-01');
  });
});

