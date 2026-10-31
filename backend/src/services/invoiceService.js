import db from '../db/knex.js';

/**
 * Calcula as datas de fechamento, vencimento e o mês de referência de uma fatura
 * para uma dada data de transação.
 *
 * @param {number} diaFechamento Dia do mês em que a fatura fecha (1-31).
 * @param {number} diaVencimento Dia do mês em que a fatura vence (1-31).
 * @param {Date|string} dataTransacao Data da compra/lançamento.
 * @returns {{ dataFechamento: string, dataVencimento: string, mesReferencia: string }}
 */
export function calculateInvoiceDates(diaFechamento, diaVencimento, dataTransacao = new Date()) {
  const transacao = typeof dataTransacao === 'string' ? new Date(dataTransacao) : dataTransacao;

  const ano = transacao.getUTCFullYear();
  const mes = transacao.getUTCMonth(); // 0 a 11
  const dia = transacao.getUTCDate();

  // Se a compra ocorreu DEPOIS do fechamento no mesmo mês, vai para o próximo ciclo
  let anoFechamento = ano;
  let mesFechamento = mes;

  if (dia > diaFechamento) {
    mesFechamento += 1;
    if (mesFechamento > 11) {
      mesFechamento = 0;
      anoFechamento += 1;
    }
  }

  // Data de fechamento calculada (ajustada para o último dia do mês se o mês tiver menos dias)
  const ultimoDiaMesFechamento = new Date(Date.UTC(anoFechamento, mesFechamento + 1, 0)).getUTCDate();
  const diaRealFechamento = Math.min(diaFechamento, ultimoDiaMesFechamento);
  const dataFechamentoObj = new Date(Date.UTC(anoFechamento, mesFechamento, diaRealFechamento));

  // Vencimento: se diaVencimento <= diaFechamento, vence no mês seguinte ao fechamento
  let anoVencimento = anoFechamento;
  let mesVencimento = mesFechamento;

  if (diaVencimento <= diaFechamento) {
    mesVencimento += 1;
    if (mesVencimento > 11) {
      mesVencimento = 0;
      anoVencimento += 1;
    }
  }

  const ultimoDiaMesVencimento = new Date(Date.UTC(anoVencimento, mesVencimento + 1, 0)).getUTCDate();
  const diaRealVencimento = Math.min(diaVencimento, ultimoDiaMesVencimento);
  const dataVencimentoObj = new Date(Date.UTC(anoVencimento, mesVencimento, diaRealVencimento));

  // O mês de referência da fatura é o YYYY-MM do vencimento
  const mesRefFormatado = `${anoVencimento}-${String(mesVencimento + 1).padStart(2, '0')}`;
  const dataFechamentoStr = dataFechamentoObj.toISOString().slice(0, 10);
  const dataVencimentoStr = dataVencimentoObj.toISOString().slice(0, 10);

  return {
    dataFechamento: dataFechamentoStr,
    dataVencimento: dataVencimentoStr,
    mesReferencia: mesRefFormatado,
  };
}

/**
 * Busca ou inicializa a fatura aberta correspondente para o cartão e data da compra.
 *
 * @param {string} usuarioId
 * @param {string} cartaoId
 * @param {Date|string} dataTransacao
 * @returns {Promise<object>} Fatura aberta
 */
export async function getOrCreateOpenInvoice(usuarioId, cartaoId, dataTransacao = new Date()) {
  const cartao = await db('cartoes')
    .where({ id: cartaoId, usuario_id: usuarioId, tipo: 'CREDITO' })
    .first();

  if (!cartao) {
    const error = new Error('Cartão de crédito não encontrado');
    error.code = 'CARD_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  const { dataFechamento, dataVencimento, mesReferencia } = calculateInvoiceDates(
    cartao.dia_fechamento,
    cartao.dia_vencimento,
    dataTransacao
  );

  let fatura = await db('faturas')
    .where({ cartao_id: cartaoId, mes_referencia: mesReferencia })
    .first();

  if (!fatura) {
    const [novaFatura] = await db('faturas')
      .insert({
        usuario_id: usuarioId,
        cartao_id: cartaoId,
        mes_referencia: mesReferencia,
        data_fechamento: dataFechamento,
        data_vencimento: dataVencimento,
        status: 'ABERTA',
        valor_total_cents: 0,
        valor_pago_cents: 0,
      })
      .returning('*');

    fatura = novaFatura;
  }

  return fatura;
}

/**
 * Lista faturas de um cartão de crédito.
 *
 * @param {string} usuarioId
 * @param {string} cartaoId
 * @returns {Promise<Array>}
 */
export async function listInvoicesByCard(usuarioId, cartaoId) {
  return db('faturas')
    .where({ usuario_id: usuarioId, cartao_id: cartaoId })
    .orderBy('data_vencimento', 'desc');
}

