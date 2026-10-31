import { describe, it, expect } from 'vitest';
import { formatCentsToBRL, formatDateBR } from '../src/utils/formatters.js';

describe('Frontend Formatters', () => {
  it('formatCentsToBRL deve formatar centavos inteiros em moeda BRL (R$)', () => {
    // R$ 150,00
    const formatted = formatCentsToBRL(15000);
    // Em pt-BR pode conter non-breaking space (char 160)
    const normalized = formatted.replace(/\u00a0/g, ' ');

    expect(normalized).toContain('R$');
    expect(normalized).toContain('150,00');
  });

  it('formatCentsToBRL deve tratar zero e valores inválidos', () => {
    const zero = formatCentsToBRL(0).replace(/\u00a0/g, ' ');
    expect(zero).toContain('0,00');

    const invalid = formatCentsToBRL(NaN).replace(/\u00a0/g, ' ');
    expect(invalid).toContain('0,00');
  });

  it('formatDateBR deve converter AAAA-MM-DD para DD/MM/AAAA', () => {
    expect(formatDateBR('2026-10-31')).toBe('31/10/2026');
    expect(formatDateBR('2026-01-05')).toBe('05/01/2026');
  });

  it('formatDateBR deve formatar strings ISO com timestamp para DD/MM/AAAA', () => {
    expect(formatDateBR('2026-10-31T00:00:00.000Z')).toBe('31/10/2026');
  });

  it('formatDateBR deve tratar strings inválidas sem quebrar', () => {
    expect(formatDateBR('')).toBe('');
    expect(formatDateBR(null)).toBe('');
  });
});

