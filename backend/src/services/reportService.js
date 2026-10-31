import db from '../db/knex.js';

/**
 * Calcula o primeiro e último dia de um mês no formato YYYY-MM.
 *
 * @param {string} monthYear 'YYYY-MM'
 * @returns {{ startDate: string, endDate: string }}
 */
function getMonthDateRange(monthYear) {
  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startDate = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${yearStr}-${monthStr.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

/**
 * Retorna o saldo consolidado de todas as contas bancárias ativas do usuário.
 * Cálculo 100% em centavos inteiros (saldo inicial + receitas pagas - despesas pagas).
 *
 * @param {string} usuarioId
 * @returns {Promise<Array>}
 */
export async function getAccountBalances(usuarioId) {
  const result = await db('contas as c')
    .leftJoin('transacoes as t', function () {
      this.on('t.conta_id', '=', 'c.id');
    })
    .where('c.usuario_id', usuarioId)
    .andWhere('c.ativa', true)
    .select(
      'c.id',
      'c.nome',
      'c.tipo',
      'c.saldo_inicial_cents',
      db.raw(`
        (
          c.saldo_inicial_cents
          + COALESCE(SUM(CASE WHEN t.type = 'income' AND t.status = 'pago' THEN t.amount_cents ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN t.type = 'expense' AND t.status = 'pago' THEN t.amount_cents ELSE 0 END), 0)
        )::BIGINT as saldo_atual_cents
      `)
    )
    .groupBy('c.id', 'c.nome', 'c.tipo', 'c.saldo_inicial_cents')
    .orderBy('c.nome', 'asc');

  // Garante tipagem de inteiros para os valores retornados pelo PostgreSQL
  return result.map((acc) => ({
    ...acc,
    saldo_inicial_cents: Number(acc.saldo_inicial_cents),
    saldo_atual_cents: Number(acc.saldo_atual_cents),
  }));
}

/**
 * Retorna o resumo consolidado de receitas e despesas de um mês específico.
 *
 * @param {string} usuarioId
 * @param {string} monthYear 'YYYY-MM'
 * @returns {Promise<object>}
 */
export async function getMonthlySummary(usuarioId, monthYear) {
  const { startDate, endDate } = getMonthDateRange(monthYear);

  const summary = await db('transacoes')
    .where('usuario_id', usuarioId)
    .whereBetween('date', [startDate, endDate])
    .select(
      db.raw("COALESCE(SUM(CASE WHEN type = 'income' AND status = 'pago' THEN amount_cents ELSE 0 END), 0)::BIGINT as total_receitas_cents"),
      db.raw("COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'pago' THEN amount_cents ELSE 0 END), 0)::BIGINT as total_despesas_cents")
    )
    .first();

  const totalReceitas = Number(summary.total_receitas_cents || 0);
  const totalDespesas = Number(summary.total_despesas_cents || 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  return {
    mes_referencia: monthYear,
    total_receitas_cents: totalReceitas,
    total_despesas_cents: totalDespesas,
    saldo_liquido_cents: saldoLiquido,
  };
}

/**
 * Retorna a distribuição de despesas agrupadas por categoria em um mês específico.
 *
 * @param {string} usuarioId
 * @param {string} monthYear 'YYYY-MM'
 * @returns {Promise<Array>}
 */
export async function getExpensesByCategory(usuarioId, monthYear) {
  const { startDate, endDate } = getMonthDateRange(monthYear);

  const result = await db('transacoes as t')
    .join('categorias as c', 't.categoria_id', 'c.id')
    .where('t.usuario_id', usuarioId)
    .andWhere('t.type', 'expense')
    .andWhere('t.status', 'pago')
    .whereBetween('t.date', [startDate, endDate])
    .select(
      'c.id as categoria_id',
      'c.nome as categoria_nome',
      db.raw('SUM(t.amount_cents)::BIGINT as total_cents')
    )
    .groupBy('c.id', 'c.nome')
    .orderBy('total_cents', 'desc');

  return result.map((item) => ({
    categoria_id: item.categoria_id,
    categoria_nome: item.categoria_nome,
    total_cents: Number(item.total_cents),
  }));
}

