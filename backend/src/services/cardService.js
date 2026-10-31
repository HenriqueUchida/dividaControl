import db from '../db/knex.js';

/**
 * Lista todos os cartões ativos de um usuário.
 *
 * @param {string} usuarioId
 * @returns {Promise<Array>}
 */
export async function listCards(usuarioId) {
  return db('cartoes')
    .where({ usuario_id: usuarioId, ativo: true })
    .orderBy('nome', 'asc');
}

/**
 * Busca um cartão por ID garantindo isolamento por usuário.
 *
 * @param {string} usuarioId
 * @param {string} cardId
 * @returns {Promise<object|null>}
 */
export async function getCardById(usuarioId, cardId) {
  return db('cartoes')
    .where({ usuario_id: usuarioId, id: cardId })
    .first();
}

/**
 * Cria um novo cartão (crédito ou débito).
 *
 * @param {string} usuarioId
 * @param {object} cardData
 * @returns {Promise<object>}
 */
export async function createCard(usuarioId, cardData) {
  const normalizedName = cardData.nome.trim();

  // Valida unicidade de nome do cartão por usuário
  const existingCard = await db('cartoes')
    .where({ usuario_id: usuarioId, nome: normalizedName })
    .first();

  if (existingCard) {
    const error = new Error('Já existe um cartão cadastrado com este nome');
    error.code = 'CARD_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  // Se for débito, verifica se a conta vinculada existe e pertence ao mesmo usuário
  if (cardData.tipo === 'DEBITO') {
    const conta = await db('contas')
      .where({ id: cardData.conta_id, usuario_id: usuarioId, ativa: true })
      .first();

    if (!conta) {
      const error = new Error('Conta bancária associada não encontrada ou inativa');
      error.code = 'ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
  }

  const [newCard] = await db('cartoes')
    .insert({
      usuario_id: usuarioId,
      conta_id: cardData.conta_id || null,
      nome: normalizedName,
      tipo: cardData.tipo,
      bandeira: cardData.bandeira ? cardData.bandeira.trim() : null,
      limite_cents: cardData.limite_cents || null,
      dia_fechamento: cardData.dia_fechamento || null,
      dia_vencimento: cardData.dia_vencimento || null,
      ativo: true,
    })
    .returning('*');

  return newCard;
}

/**
 * Atualiza dados de um cartão existente.
 *
 * @param {string} usuarioId
 * @param {string} cardId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateCard(usuarioId, cardId, updates) {
  const card = await getCardById(usuarioId, cardId);
  if (!card) {
    const error = new Error('Cartão não encontrado');
    error.code = 'CARD_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (updates.nome && updates.nome.trim() !== card.nome) {
    const nameExists = await db('cartoes')
      .where({ usuario_id: usuarioId, nome: updates.nome.trim() })
      .whereNot({ id: cardId })
      .first();

    if (nameExists) {
      const error = new Error('Já existe um cartão cadastrado com este nome');
      error.code = 'CARD_ALREADY_EXISTS';
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

  const [updatedCard] = await db('cartoes')
    .where({ usuario_id: usuarioId, id: cardId })
    .update(fieldsToUpdate)
    .returning('*');

  return updatedCard;
}

/**
 * Desativa (soft-delete) um cartão.
 *
 * @param {string} usuarioId
 * @param {string} cardId
 * @returns {Promise<object>}
 */
export async function deleteCard(usuarioId, cardId) {
  const card = await getCardById(usuarioId, cardId);
  if (!card) {
    const error = new Error('Cartão não encontrado');
    error.code = 'CARD_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const [deactivated] = await db('cartoes')
    .where({ usuario_id: usuarioId, id: cardId })
    .update({
      ativo: false,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return deactivated;
}

