import { z } from 'zod';

export const registerSchema = z.object({
  nome: z
    .string({ required_error: 'O nome é obrigatório' })
    .trim()
    .min(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
    .max(100, { message: 'O nome deve ter no máximo 100 caracteres' }),
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .trim()
    .email({ message: 'Formato de e-mail inválido' })
    .max(255, { message: 'O e-mail deve ter no máximo 255 caracteres' }),
  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres' }),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'O e-mail é obrigatório' })
    .trim()
    .email({ message: 'Formato de e-mail inválido' }),
  senha: z
    .string({ required_error: 'A senha é obrigatória' })
    .min(1, { message: 'A senha é obrigatória' }),
});

