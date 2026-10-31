import { z } from 'zod';

export const ACCOUNT_TYPES = ['CORRENTE', 'POUPANCA', 'CARTEIRA', 'INVESTIMENTO'];

export const createAccountSchema = z.object({
  nome: z
    .string({ required_error: 'O nome da conta é obrigatório' })
    .trim()
    .min(1, { message: 'O nome da conta não pode ser vazio' })
    .max(100, { message: 'O nome da conta deve ter no máximo 100 caracteres' }),
  tipo: z.enum(ACCOUNT_TYPES, {
    errorMap: () => ({
      message: `Tipo de conta inválido. Opções válidas: ${ACCOUNT_TYPES.join(', ')}`,
    }),
  }),
  // Regra fundamental: saldo_inicial_cents deve ser inteiro (centavos), nunca float
  saldo_inicial_cents: z
    .number({ required_error: 'O saldo inicial em centavos é obrigatório' })
    .int({ message: 'O saldo inicial deve ser um número inteiro representando os centavos' })
    .default(0),
});

export const updateAccountSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: 'O nome da conta não pode ser vazio' })
    .max(100, { message: 'O nome da conta deve ter no máximo 100 caracteres' })
    .optional(),
  tipo: z.enum(ACCOUNT_TYPES).optional(),
  ativa: z.boolean().optional(),
});

