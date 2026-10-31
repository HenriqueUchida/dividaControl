import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/knex.js';
import { seedDefaultCategories } from './categoryService.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-para-ambiente-de-desenvolvimento-e-testes';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Gera o hash criptográfico seguro de uma senha.
 *
 * @param {string} password Senha pura informada pelo usuário.
 * @returns {Promise<string>} Hash da senha.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha pura com um hash persistido.
 *
 * @param {string} password Senha pura informada.
 * @param {string} hash Hash armazenado no banco.
 * @returns {Promise<boolean>} Verdadeiro se a senha for válida.
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Emite um token JWT para um usuário autenticado.
 *
 * @param {object} payload Dados a serem embutidos no token (ex: { userId, email }).
 * @returns {string} Token JWT assinado.
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Valida e decodifica um token JWT.
 *
 * @param {string} token Token JWT recebido na requisição.
 * @returns {object} Payload decodificado.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Remove dados sensíveis do objeto do usuário antes de devolver na resposta.
 *
 * @param {object} user Objeto do usuário retornado pelo banco.
 * @returns {object} Usuário sem senha_hash.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { senha_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Busca um usuário pelo e-mail.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  return db('usuarios').where({ email: normalizedEmail }).first();
}

/**
 * Busca um usuário pelo ID.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findUserById(id) {
  return db('usuarios').where({ id }).first();
}

/**
 * Registra um novo usuário no banco.
 *
 * @param {object} params
 * @param {string} params.nome
 * @param {string} params.email
 * @param {string} params.senha
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function registerUser({ nome, email, senha }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error('E-mail já cadastrado');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  const senha_hash = await hashPassword(senha);
  const normalizedEmail = email.trim().toLowerCase();

  return db.transaction(async (trx) => {
    const [createdUser] = await trx('usuarios')
      .insert({
        nome: nome.trim(),
        email: normalizedEmail,
        senha_hash,
        ativo: true,
      })
      .returning('*');

    // Cadastra categorias padronizadas automaticamente
    await seedDefaultCategories(createdUser.id, trx);

    const token = generateToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return {
      user: sanitizeUser(createdUser),
      token,
    };
  });
}

/**
 * Autentica um usuário existente com e-mail e senha.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.senha
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginUser({ email, senha }) {
  const user = await findUserByEmail(email);
  if (!user || !user.ativo) {
    const error = new Error('E-mail ou senha inválidos');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await comparePassword(senha, user.senha_hash);
  if (!passwordMatch) {
    const error = new Error('E-mail ou senha inválidos');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
}
