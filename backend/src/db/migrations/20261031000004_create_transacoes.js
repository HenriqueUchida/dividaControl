/**
 * Migration para criação da tabela de transações e lançamentos financeiros.
 *
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable('transacoes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onDelete('CASCADE');
    table
      .uuid('conta_id')
      .nullable()
      .references('id')
      .inTable('contas')
      .onDelete('SET NULL');
    table
      .uuid('cartao_id')
      .nullable()
      .references('id')
      .inTable('cartoes')
      .onDelete('SET NULL');
    table
      .uuid('fatura_id')
      .nullable()
      .references('id')
      .inTable('faturas')
      .onDelete('SET NULL');
    table
      .uuid('categoria_id')
      .notNullable()
      .references('id')
      .inTable('categorias')
      .onDelete('RESTRICT');

    // Regra inegociável: valor em centavos (inteiro), sempre positivo
    table.bigInteger('amount_cents').notNullable();
    table.string('type', 20).notNullable(); // 'income' ou 'expense'
    table.date('date').notNullable();
    table.text('descricao').notNullable();
    table.string('status', 20).notNullable().defaultTo('pago'); // 'pago' ou 'pendente'

    // Identificador para agrupar as duas pernas de uma transferência entre contas
    table.uuid('transferencia_id').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Índices de alta performance
    table.index(['usuario_id', 'date'], 'idx_transacoes_usuario_data');
    table.index(['categoria_id'], 'idx_transacoes_categoria');
    table.index(['conta_id'], 'idx_transacoes_conta');
    table.index(['cartao_id'], 'idx_transacoes_cartao');
    table.index(['fatura_id'], 'idx_transacoes_fatura');
    table.index(['transferencia_id'], 'idx_transacoes_transferencia');
  });

  // Constraints CHECK no PostgreSQL
  await knex.raw(`
    ALTER TABLE transacoes
    ADD CONSTRAINT chk_transacoes_amount_positive
    CHECK (amount_cents > 0);

    ALTER TABLE transacoes
    ADD CONSTRAINT chk_transacoes_type
    CHECK (type IN ('income', 'expense'));

    ALTER TABLE transacoes
    ADD CONSTRAINT chk_transacoes_status
    CHECK (status IN ('pago', 'pendente'));

    ALTER TABLE transacoes
    ADD CONSTRAINT chk_transacoes_origem
    CHECK (conta_id IS NOT NULL OR cartao_id IS NOT NULL);
  `);
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('transacoes');
}

