import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  sanitizeUser,
} from '../src/services/authService.js';
import { registerSchema, loginSchema } from '../src/validators/authValidator.js';

describe('authService', () => {
  it('deve gerar hash e validar senha corretamente', async () => {
    const plainPassword = 'senha-segura-123';
    const hash = await hashPassword(plainPassword);

    expect(hash).not.toBe(plainPassword);
    expect(await comparePassword(plainPassword, hash)).toBe(true);
    expect(await comparePassword('senha-errada', hash)).toBe(false);
  });

  it('deve emitir e verificar token JWT com sucesso', () => {
    const payload = { userId: '123e4567-e89b-12d3-a456-426614174000', email: 'usuario@exemplo.com' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('deve lançar erro ao verificar token JWT inválido', () => {
    expect(() => verifyToken('token-invalido-qualquer')).toThrow();
  });

  it('deve sanitizar o usuário removendo o campo senha_hash', () => {
    const rawUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nome: 'Usuário Teste',
      email: 'teste@exemplo.com',
      senha_hash: '$2a$10$xyz...',
      ativo: true,
    };

    const safeUser = sanitizeUser(rawUser);

    expect(safeUser).not.toHaveProperty('senha_hash');
    expect(safeUser.nome).toBe('Usuário Teste');
    expect(safeUser.id).toBe(rawUser.id);
  });
});

describe('authValidator', () => {
  it('deve validar dados válidos no cadastro', () => {
    const validData = {
      nome: 'Geraldo Silva',
      email: 'geraldo@exemplo.com',
      senha: 'senha-valida-123',
    };

    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar cadastro com e-mail inválido ou senha curta', () => {
    const invalidEmail = {
      nome: 'Geraldo Silva',
      email: 'email-invalido',
      senha: '123456',
    };

    const shortPassword = {
      nome: 'Geraldo Silva',
      email: 'geraldo@exemplo.com',
      senha: '123',
    };

    expect(registerSchema.safeParse(invalidEmail).success).toBe(false);
    expect(registerSchema.safeParse(shortPassword).success).toBe(false);
  });

  it('deve validar dados válidos no login', () => {
    const validLogin = {
      email: 'geraldo@exemplo.com',
      senha: 'senha-valida',
    };

    expect(loginSchema.safeParse(validLogin).success).toBe(true);
  });
});

