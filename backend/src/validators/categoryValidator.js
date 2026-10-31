import { z } from 'zod';

export const CATEGORY_TYPES = ['income', 'expense'];

export const createCategorySchema = z.object({
  nome: z
    .string({ required_error: 'O nome da categoria é obrigatório' })
    .trim()
    .min(1, { message: 'O nome da categoria não pode ser vazio' })
    .max(100, { message: 'O nome da categoria deve ter no máximo 100 caracteres' }),
  tipo: z.enum(CATEGORY_TYPES, {
    errorMap: () => ({
      message: `Tipo de categoria inválido. Opções válidas: ${CATEGORY_TYPES.join(', ')}`,
    }),
  }),
});

export const updateCategorySchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: 'O nome da categoria não pode ser vazio' })
    .max(100, { message: 'O nome da categoria deve ter no máximo 100 caracteres' })
    .optional(),
  ativa: z.boolean().optional(),
});

