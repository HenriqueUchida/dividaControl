/**
 * Migration para criação das tabelas de contas bancárias e categorias.
 *
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  // 1. Tabela de contas bancárias
  await knex.schema.createTable('contas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onDelete('CASCADE');
    table.string('nome', 100).notNullable();
    table
      .string('tipo', 30)
      .notNullable()
      .defaultTo('CORRENTE');
    // Saldo inicial sempre em centavos (inteiro, sem float)
    table.bigInteger('saldo_inicial_cents').notNullable().defaultTo(0);
    table.boolean('ativa').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints e índices
    table.unique(['usuario_id', 'nome'], { indexName: 'uq_contas_usuario_nome' });
    table.unique(['usuario_id', 'id'], { indexName: 'uq_contas_usuario_id' });
  });

  // Constraint CHECK para tipos válidos de contas
  await knex.raw(`
    ALTER TABLE contas
    ADD CONSTRAINT chk_contas_tipo
    CHECK (tipo IN ('CORRENTE', 'POUPANCA', 'CARTEIRA', 'INVESTIMENTO'))
  `);

  // 2. Tabela de categorias de despesas/receitas
  await knex.schema.createTable('categorias', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onDelete('CASCADE');
    table.string('nome', 100).notNullable();
    table.string('tipo', 20).notNullable(); // 'income' ou 'expense'
    table.boolean('ativa').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints e índices
    table.unique(['usuario_id', 'tipo', 'nome'], { indexName: 'uq_categorias_usuario_tipo_nome' });
    table.unique(['usuario_id', 'id'], { indexName: 'uq_categorias_usuario_id' });
  });

  // Constraint CHECK para tipos de categorias válidos
  await knex.raw(`
    ALTER TABLE categorias
    ADD CONSTRAINT chk_categorias_tipo
    CHECK (tipo IN ('income', 'expense'))
  `);
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('categorias');
  await knex.schema.dropTableIfExists('contas');
}

