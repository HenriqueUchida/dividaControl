import db from '../db/knex.js';

export const DEFAULT_CATEGORIES = [
  // Despesas
  { nome: 'Alimentação', tipo: 'expense' },
  { nome: 'Moradia', tipo: 'expense' },
  { nome: 'Transporte', tipo: 'expense' },
  { nome: 'Saúde', tipo: 'expense' },
  { nome: 'Educação', tipo: 'expense' },
  { nome: 'Lazer', tipo: 'expense' },
  { nome: 'Contas & Serviços', tipo: 'expense' },
  { nome: 'Outros', tipo: 'expense' },
  // Receitas
  { nome: 'Salário', tipo: 'income' },
  { nome: 'Rendimentos', tipo: 'income' },
  { nome: 'Investimentos', tipo: 'income' },
  { nome: 'Outras Receitas', tipo: 'income' },
];

/**
 * Cadastra as categorias padrão para o usuário caso ainda não existam.
 *
 * @param {string} usuarioId
 * @param {import('knex').Knex|import('knex').Knex.Transaction} [executor=db]
 * @returns {Promise<Array>}
 */
export async function seedDefaultCategories(usuarioId, executor = db) {
  const existing = await executor('categorias')
    .where({ usuario_id: usuarioId })
    .select('nome', 'tipo');

  const existingSet = new Set(existing.map((c) => `${c.tipo}:${c.nome.toLowerCase()}`));

  const toInsert = DEFAULT_CATEGORIES.filter(
    (c) => !existingSet.has(`${c.tipo}:${c.nome.toLowerCase()}`)
  ).map((c) => ({
    usuario_id: usuarioId,
    nome: c.nome,
    tipo: c.tipo,
    ativa: true,
  }));

  if (toInsert.length > 0) {
    return executor('categorias').insert(toInsert).returning('*');
  }

  return [];
}

/**
 * Lista categorias ativas de um usuário, opcionalmente filtrando por tipo.
 *
 * @param {string} usuarioId
 * @param {string} [tipo] 'income' ou 'expense'
 * @returns {Promise<Array>}
 */
export async function listCategories(usuarioId, tipo) {
  const query = db('categorias')
    .where({ usuario_id: usuarioId, ativa: true });

  if (tipo) {
    query.andWhere({ tipo });
  }

  return query.orderBy('nome', 'asc');
}

/**
 * Busca uma categoria por ID garantindo isolamento por usuário.
 *
 * @param {string} usuarioId
 * @param {string} categoryId
 * @returns {Promise<object|null>}
 */
export async function getCategoryById(usuarioId, categoryId) {
  return db('categorias')
    .where({ usuario_id: usuarioId, id: categoryId })
    .first();
}

/**
 * Cria uma nova categoria para o usuário.
 *
 * @param {string} usuarioId
 * @param {object} categoryData
 * @param {string} categoryData.nome
 * @param {string} categoryData.tipo
 * @returns {Promise<object>}
 */
export async function createCategory(usuarioId, categoryData) {
  const normalizedName = categoryData.nome.trim();

  // Valida unicidade de (usuario_id, tipo, nome)
  const existingCategory = await db('categorias')
    .where({
      usuario_id: usuarioId,
      tipo: categoryData.tipo,
      nome: normalizedName,
    })
    .first();

  if (existingCategory) {
    const error = new Error('Já existe uma categoria cadastrada com este nome e tipo');
    error.code = 'CATEGORY_ALREADY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  const [newCategory] = await db('categorias')
    .insert({
      usuario_id: usuarioId,
      nome: normalizedName,
      tipo: categoryData.tipo,
      ativa: true,
    })
    .returning('*');

  return newCategory;
}

/**
 * Atualiza uma categoria existente.
 *
 * @param {string} usuarioId
 * @param {string} categoryId
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateCategory(usuarioId, categoryId, updates) {
  const category = await getCategoryById(usuarioId, categoryId);
  if (!category) {
    const error = new Error('Categoria não encontrada');
    error.code = 'CATEGORY_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (updates.nome && updates.nome.trim() !== category.nome) {
    const nameExists = await db('categorias')
      .where({
        usuario_id: usuarioId,
        tipo: category.tipo,
        nome: updates.nome.trim(),
      })
      .whereNot({ id: categoryId })
      .first();

    if (nameExists) {
      const error = new Error('Já existe uma categoria cadastrada com este nome e tipo');
      error.code = 'CATEGORY_ALREADY_EXISTS';
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

  const [updatedCategory] = await db('categorias')
    .where({ usuario_id: usuarioId, id: categoryId })
    .update(fieldsToUpdate)
    .returning('*');

  return updatedCategory;
}

/**
 * Desativa (soft-delete) uma categoria.
 *
 * @param {string} usuarioId
 * @param {string} categoryId
 * @returns {Promise<object>}
 */
export async function deleteCategory(usuarioId, categoryId) {
  const category = await getCategoryById(usuarioId, categoryId);
  if (!category) {
    const error = new Error('Categoria não encontrada');
    error.code = 'CATEGORY_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const [deactivated] = await db('categorias')
    .where({ usuario_id: usuarioId, id: categoryId })
    .update({
      ativa: false,
      updated_at: db.fn.now(),
    })
    .returning('*');

  return deactivated;
}
