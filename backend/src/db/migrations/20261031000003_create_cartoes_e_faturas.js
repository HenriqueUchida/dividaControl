/**
 * Migration para criação das tabelas de cartões e faturas de cartão de crédito.
 *
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  // 1. Tabela de cartões (débito e crédito)
  await knex.schema.createTable('cartoes', (table) => {
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
    table.string('nome', 100).notNullable();
    table.string('tipo', 20).notNullable(); // 'CREDITO' ou 'DEBITO'
    table.string('bandeira', 50).nullable();
    // Limite guardado estritamente em centavos (inteiro)
    table.bigInteger('limite_cents').nullable();
    table.smallint('dia_fechamento').nullable();
    table.smallint('dia_vencimento').nullable();
    table.boolean('ativo').notNullable().defaultTo(true);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['usuario_id', 'nome'], { indexName: 'uq_cartoes_usuario_nome' });
    table.unique(['usuario_id', 'id'], { indexName: 'uq_cartoes_usuario_id' });
  });

  // Constraints CHECK para cartões
  await knex.raw(`
    ALTER TABLE cartoes
    ADD CONSTRAINT chk_cartoes_tipo
    CHECK (tipo IN ('CREDITO', 'DEBITO'));

    ALTER TABLE cartoes
    ADD CONSTRAINT chk_cartoes_fechamento
    CHECK (dia_fechamento IS NULL OR (dia_fechamento >= 1 AND dia_fechamento <= 31));

    ALTER TABLE cartoes
    ADD CONSTRAINT chk_cartoes_vencimento
    CHECK (dia_vencimento IS NULL OR (dia_vencimento >= 1 AND dia_vencimento <= 31));

    ALTER TABLE cartoes
    ADD CONSTRAINT chk_cartoes_regras_tipo
    CHECK (
      (tipo = 'DEBITO' AND conta_id IS NOT NULL)
      OR
      (tipo = 'CREDITO' AND limite_cents IS NOT NULL AND dia_fechamento IS NOT NULL AND dia_vencimento IS NOT NULL)
    );
  `);

  // 2. Tabela de faturas de cartão de crédito
  await knex.schema.createTable('faturas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('usuario_id')
      .notNullable()
      .references('id')
      .inTable('usuarios')
      .onDelete('CASCADE');
    table
      .uuid('cartao_id')
      .notNullable()
      .references('id')
      .inTable('cartoes')
      .onDelete('CASCADE');
    table.string('mes_referencia', 7).notNullable(); // 'YYYY-MM'
    table.date('data_fechamento').notNullable();
    table.date('data_vencimento').notNullable();
    table.string('status', 20).notNullable().defaultTo('ABERTA'); // 'ABERTA', 'FECHADA', 'PAGA'
    // Valores monetários em centavos (inteiro, sem float)
    table.bigInteger('valor_total_cents').notNullable().defaultTo(0);
    table.bigInteger('valor_pago_cents').notNullable().defaultTo(0);
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(['cartao_id', 'mes_referencia'], { indexName: 'uq_faturas_cartao_mes' });
  });

  // Constraints CHECK para faturas
  await knex.raw(`
    ALTER TABLE faturas
    ADD CONSTRAINT chk_faturas_status
    CHECK (status IN ('ABERTA', 'FECHADA', 'PAGA'));

    ALTER TABLE faturas
    ADD CONSTRAINT chk_faturas_valor_total
    CHECK (valor_total_cents >= 0);

    ALTER TABLE faturas
    ADD CONSTRAINT chk_faturas_valor_pago
    CHECK (valor_pago_cents >= 0);
  `);
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('faturas');
  await knex.schema.dropTableIfExists('cartoes');
}

