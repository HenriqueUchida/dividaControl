import { z } from 'zod';

export const CARD_TYPES = ['CREDITO', 'DEBITO'];

export const createCardSchema = z
  .object({
    nome: z
      .string({ required_error: 'O nome do cartão é obrigatório' })
      .trim()
      .min(1, { message: 'O nome do cartão não pode ser vazio' })
      .max(100, { message: 'O nome do cartão deve ter no máximo 100 caracteres' }),
    tipo: z.enum(CARD_TYPES, {
      errorMap: () => ({
        message: `Tipo de cartão inválido. Opções válidas: ${CARD_TYPES.join(', ')}`,
      }),
    }),
    conta_id: z.string().uuid({ message: 'ID da conta bancária inválido' }).optional(),
    bandeira: z.string().trim().max(50).optional(),
    // Regra: limite deve ser inteiro em centavos, proibido float
    limite_cents: z
      .number()
      .int({ message: 'O limite deve ser um número inteiro representando os centavos' })
      .positive({ message: 'O limite deve ser maior que zero' })
      .optional(),
    dia_fechamento: z
      .number()
      .int()
      .min(1, { message: 'O dia de fechamento deve ser entre 1 e 31' })
      .max(31, { message: 'O dia de fechamento deve ser entre 1 e 31' })
      .optional(),
    dia_vencimento: z
      .number()
      .int()
      .min(1, { message: 'O dia de vencimento deve ser entre 1 e 31' })
      .max(31, { message: 'O dia de vencimento deve ser entre 1 e 31' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'DEBITO' && !data.conta_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cartão de débito exige uma conta bancária vinculada',
        path: ['conta_id'],
      });
    }

    if (data.tipo === 'CREDITO') {
      if (data.limite_cents === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cartão de crédito exige a definição de um limite em centavos',
          path: ['limite_cents'],
        });
      }
      if (!data.dia_fechamento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cartão de crédito exige o dia de fechamento da fatura',
          path: ['dia_fechamento'],
        });
      }
      if (!data.dia_vencimento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cartão de crédito exige o dia de vencimento da fatura',
          path: ['dia_vencimento'],
        });
      }
    }
  });

export const updateCardSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: 'O nome do cartão não pode ser vazio' })
    .max(100, { message: 'O nome do cartão deve ter no máximo 100 caracteres' })
    .optional(),
  bandeira: z.string().trim().max(50).optional(),
  limite_cents: z
    .number()
    .int({ message: 'O limite deve ser um número inteiro em centavos' })
    .positive({ message: 'O limite deve ser maior que zero' })
    .optional(),
  dia_fechamento: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional(),
  dia_vencimento: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional(),
  ativa: z.boolean().optional(),
});

