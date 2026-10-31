import db from '../db/knex.js';

/**
 * Lista todas as contas ativas de um usuário.
 *
 * @param {string} usuarioId
 * @returns {Promise<Array>}
 */
export async function listAccounts(usuarioId) {
  return db('contas')
    .where({ usuario_id: usuarioId, ativa: true })
    .orderBy('nome', 'asc');
}

/**
 * Busca uma conta específica garantindo o isolamento por usuário.
 *
 * @param {string} usuarioId
 * @param {string} accountId
 * @returns {Promise<object|null>}
 */
export async function getAccountById(usuarioId, accountId) {
  return db('contas')
    .where({ usuario_id: usuarioId, id: accountId })
    .first();
}

/**
 * Cria uma nova conta bancária para o usuário.
 *
 * @param {string} usuarioId
 * @param {object} accountData
 * @param {string} accountData.nome
 * @param {string} accountData.tipo
 * @param {number} accountData.saldo_inicial_cents
 * @returns {Promise<object>}
 */
export async function createAccount(usuarioId, accountData) {
  const normalizedName = accountData.nome.trim();

  // Valida unicidade de nome por usuário
  const existingAccount = await db('contas')
    .where({ usuario_id: usuarioId, nome: normalizedName })
    .first();

  if (existingAccount) {
    const error = new Error('Já existe uma conta cadastrada com este nome');
    error.code = 'ACCOUNT_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  const [newAccount] = await db('contas')
    .insert({
      usuario_id: usuarioId,
      nome: normalizedName,
      tipo: accountData.tipo,
      saldo_inicial_cents: accountData.saldo_inicial_cents,
      ativa: true,
    })
    .returning('*');

  return newAccount;
}

/**
 * Atualiza dados de uma conta existente do usuário.
 *
 * @param {string} usuarioId
 * @param {string} accountId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateAccount(usuarioId, accountId, updates) {
  const account = await getAccountById(usuarioId, accountId);
  if (!account) {
    const error = new Error('Conta bancária não encontrada');
    error.code = 'ACCOUNT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (updates.nome && updates.nome.trim() !== account.nome) {
    const nameExists = await db('contas')
      .where({ usuario_id: usuarioId, nome: updates.nome.trim() })
      .whereNot({ id: accountId })
      .first();

    if (nameExists) {
      const error = new Error('Já existe uma conta com este nome');
      error.code = 'ACCOUNT_ALREADY_EXISTS';
      error.statusCode = 409;
      throw error;
    }
  }

  const fieldsToUpdate = {
    ...updates,
    updated_at: db.fn.now(),
  };

  if (fieldsToUpdate.nome) {
    fieldsToUpdate.nome = fieldsToUpdate.nome.trim();
  }

  const [updatedAccount] = await db('contas')
    .where({ usuario_id: usuarioId, id: accountId })
    .update(fieldsToUpdate)
    .returning('*');

  return updatedAccount;
}

/**
 * Desativa (soft-delete) uma conta bancária do usuário.
 *
 * @param {string} usuarioId
 * @param {string} accountId
 * @returns {Promise<object>}
 */
export async function deleteAccount(usuarioId, accountId) {
  const account = await getAccountById(usuarioId, accountId);
  if (!account) {
    const error = new Error('Conta bancária não encontrada');
    error.code = 'ACCOUNT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const [deactivated] = await db('contas')
    .where({ usuario_id: usuarioId, id: accountId })
    .update({
      ativa: false,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return deactivated;
}

