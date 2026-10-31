import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import * as authService from '../src/services/authService.js';

describe('Rotas de Autenticação (/auth)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /auth/register', () => {
    it('deve retornar 400 quando o payload for inválido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: '',
          email: 'invalido',
          senha: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toHaveProperty('email');
    });

    it('deve retornar 201 com usuário e token quando o registro for bem sucedido', async () => {
      const mockResult = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nome: 'Usuário Teste',
          email: 'teste@exemplo.com',
          ativo: true,
        },
        token: 'mocked-jwt-token',
      };

      vi.spyOn(authService, 'registerUser').mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: 'teste@exemplo.com',
          senha: 'senha-segura-123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
    });

    it('deve retornar 409 quando o e-mail já estiver cadastrado', async () => {
      const emailConflictError = new Error('E-mail já cadastrado');
      emailConflictError.code = 'EMAIL_ALREADY_EXISTS';
      emailConflictError.statusCode = 409;

      vi.spyOn(authService, 'registerUser').mockRejectedValue(emailConflictError);

      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: 'duplicado@exemplo.com',
          senha: 'senha-segura-123',
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /auth/login', () => {
    it('deve retornar 400 quando dados forem omitidos', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: '',
          senha: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('deve retornar 200 com token ao fornecer credenciais válidas', async () => {
      const mockResult = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nome: 'Usuário Teste',
          email: 'teste@exemplo.com',
        },
        token: 'mocked-login-token',
      };

      vi.spyOn(authService, 'loginUser').mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: 'senha-correta',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });

    it('deve retornar 401 quando as credenciais forem inválidas', async () => {
      const authError = new Error('E-mail ou senha inválidos');
      authError.code = 'INVALID_CREDENTIALS';
      authError.statusCode = 401;

      vi.spyOn(authService, 'loginUser').mockRejectedValue(authError);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'teste@exemplo.com',
          senha: 'senha-errada',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /auth/me (Rota Protegida)', () => {
    it('deve retornar 401 quando o header Authorization for omitido', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('deve retornar 401 quando o token for inválido', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('deve retornar 200 e dados do usuário quando o token for válido', async () => {
      const validToken = authService.generateToken({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'teste@exemplo.com',
      });

      const mockDbUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nome: 'Usuário Teste',
        email: 'teste@exemplo.com',
        senha_hash: 'hash-secreto',
        ativo: true,
      };

      vi.spyOn(authService, 'findUserById').mockResolvedValue(mockDbUser);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.nome).toBe('Usuário Teste');
      expect(response.body.user).not.toHaveProperty('senha_hash');
    });
  });
});

