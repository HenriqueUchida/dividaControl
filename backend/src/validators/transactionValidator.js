import { z } from 'zod';

export const TRANSACTION_TYPES = ['income', 'expense'];
export const TRANSACTION_STATUSES = ['pago', 'pendente'];

export const createTransactionSchema = z
  .object({
    descricao: z
      .string({ required_error: 'A descrição da transação é obrigatória' })
      .trim()
      .min(1, { message: 'A descrição não pode ser vazia' })
      .max(255, { message: 'A descrição deve ter no máximo 255 caracteres' }),
    // Regra fundamental: amount_cents deve ser inteiro (centavos), estritamente positivo
    amount_cents: z
      .number({ required_error: 'O valor da transação em centavos é obrigatório' })
      .int({ message: 'O valor deve ser um número inteiro representando os centavos' })
      .positive({ message: 'O valor da transação deve ser estritamente maior que zero' }),
    type: z.enum(TRANSACTION_TYPES, {
      errorMap: () => ({
        message: `Tipo de transação inválido. Permitido: ${TRANSACTION_TYPES.join(', ')}`,
      }),
    }),
    date: z
      .string({ required_error: 'A data da transação é obrigatória' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato AAAA-MM-DD' }),
    status: z.enum(TRANSACTION_STATUSES).default('pago'),
    categoria_id: z
      .string({ required_error: 'A categoria é obrigatória' })
      .uuid({ message: 'ID de categoria inválido' }),
    conta_id: z.string().uuid({ message: 'ID de conta inválido' }).optional(),
    cartao_id: z.string().uuid({ message: 'ID de cartão inválido' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.conta_id && !data.cartao_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A transação deve estar associada a uma conta bancária ou a um cartão',
        path: ['conta_id'],
      });
    }
  });

export const transferSchema = z
  .object({
    conta_origem_id: z
      .string({ required_error: 'Conta de origem é obrigatória' })
      .uuid({ message: 'ID da conta de origem inválido' }),
    conta_destino_id: z
      .string({ required_error: 'Conta de destino é obrigatória' })
      .uuid({ message: 'ID da conta de destino inválido' }),
    amount_cents: z
      .number({ required_error: 'O valor da transferência é obrigatório' })
      .int({ message: 'O valor deve ser um número inteiro representando os centavos' })
      .positive({ message: 'O valor deve ser estritamente maior que zero' }),
    date: z
      .string({ required_error: 'A data é obrigatória' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato AAAA-MM-DD' }),
    descricao: z.string().trim().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.conta_origem_id === data.conta_destino_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A conta de origem e destino não podem ser iguais',
        path: ['conta_destino_id'],
      });
    }
  });

