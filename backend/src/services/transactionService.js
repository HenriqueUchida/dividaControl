import crypto from 'crypto';
import db from '../db/knex.js';
import * as invoiceService from './invoiceService.js';

/**
 * Lista transações do usuário com suporte a filtros parametrizados.
 *
 * @param {string} usuarioId
 * @param {object} filters
 * @returns {Promise<Array>}
 */
export async function listTransactions(usuarioId, filters = {}) {
  const query = db('transacoes')
    .where('transacoes.usuario_id', usuarioId)
    .leftJoin('contas', 'transacoes.conta_id', 'contas.id')
    .leftJoin('cartoes', 'transacoes.cartao_id', 'cartoes.id')
    .leftJoin('categorias', 'transacoes.categoria_id', 'categorias.id')
    .select(
      'transacoes.*',
      'contas.nome as conta_nome',
      'cartoes.nome as cartao_nome',
      'categorias.nome as categoria_nome'
    );

  if (filters.startDate) {
    query.andWhere('transacoes.date', '>=', filters.startDate);
  }
  if (filters.endDate) {
    query.andWhere('transacoes.date', '<=', filters.endDate);
  }
  if (filters.contaId) {
    query.andWhere('transacoes.conta_id', filters.contaId);
  }
  if (filters.cartaoId) {
    query.andWhere('transacoes.cartao_id', filters.cartaoId);
  }
  if (filters.categoriaId) {
    query.andWhere('transacoes.categoria_id', filters.categoriaId);
  }
  if (filters.type) {
    query.andWhere('transacoes.type', filters.type);
  }
  if (filters.status) {
    query.andWhere('transacoes.status', filters.status);
  }

  return query.orderBy('transacoes.date', 'desc').orderBy('transacoes.created_at', 'desc');
}

/**
 * Cria uma nova transação simples (receita ou despesa).
 * Caso seja despesa no cartão de crédito, associa à fatura corrente.
 *
 * @param {string} usuarioId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function createTransaction(usuarioId, data) {
  return db.transaction(async (trx) => {
    // 1. Valida categoria
    const categoria = await trx('categorias')
      .where({ id: data.categoria_id, usuario_id: usuarioId, ativa: true })
      .first();

    if (!categoria) {
      const error = new Error('Categoria não encontrada ou inativa');
      error.code = 'CATEGORY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    let faturaId = null;

    // 2. Se for cartão, valida vínculo e cartão de crédito
    if (data.cartao_id) {
      const cartao = await trx('cartoes')
        .where({ id: data.cartao_id, usuario_id: usuarioId, ativo: true })
        .first();

      if (!cartao) {
        const error = new Error('Cartão não encontrado ou inativo');
        error.code = 'CARD_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      if (cartao.tipo === 'CREDITO') {
        const fatura = await invoiceService.getOrCreateOpenInvoice(usuarioId, cartao.id, data.date);
        faturaId = fatura.id;

        // Atualiza o valor total da fatura em centavos
        await trx('faturas')
          .where({ id: faturaId })
          .increment('valor_total_cents', data.amount_cents);
      }
    }

    // 3. Se for conta bancária, valida existência
    if (data.conta_id) {
      const conta = await trx('contas')
        .where({ id: data.conta_id, usuario_id: usuarioId, ativa: true })
        .first();

      if (!conta) {
        const error = new Error('Conta bancária não encontrada ou inativa');
        error.code = 'ACCOUNT_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
    }

    // 4. Insere a transação
    const [novaTransacao] = await trx('transacoes')
      .insert({
        usuario_id: usuarioId,
        conta_id: data.conta_id || null,
        cartao_id: data.cartao_id || null,
        fatura_id: faturaId,
        categoria_id: data.categoria_id,
        amount_cents: data.amount_cents,
        type: data.type,
        date: data.date,
        descricao: data.descricao.trim(),
        status: data.status || 'pago',
      })
      .returning('*');

    return novaTransacao;
  });
}

/**
 * Realiza uma transferência atômica entre duas contas bancárias em uma única transação ACID.
 *
 * @param {string} usuarioId
 * @param {object} transferData
 * @returns {Promise<{ saida: object, entrada: object }>}
 */
export async function createTransfer(usuarioId, transferData) {
  return db.transaction(async (trx) => {
    const { conta_origem_id, conta_destino_id, amount_cents, date, descricao } = transferData;

    // Valida contas de origem e destino
    const [origem, destino] = await Promise.all([
      trx('contas').where({ id: conta_origem_id, usuario_id: usuarioId, ativa: true }).first(),
      trx('contas').where({ id: conta_destino_id, usuario_id: usuarioId, ativa: true }).first(),
    ]);

    if (!origem) {
      const error = new Error('Conta de origem não encontrada ou inativa');
      error.code = 'ORIGIN_ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    if (!destino) {
      const error = new Error('Conta de destino não encontrada ou inativa');
      error.code = 'DESTINATION_ACCOUNT_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Busca ou cria categoria do sistema para transferência
    let categoriaTransferencia = await trx('categorias')
      .where({ usuario_id: usuarioId, nome: 'Transferência' })
      .first();

    if (!categoriaTransferencia) {
      const [novaCat] = await trx('categorias')
        .insert({
          usuario_id: usuarioId,
          nome: 'Transferência',
          tipo: 'expense',
          ativa: true,
        })
        .returning('*');
      categoriaTransferencia = novaCat;
    }

    const transferenciaId = crypto.randomUUID();
    const desc = descricao ? descricao.trim() : `Transferência: ${origem.nome} -> ${destino.nome}`;

    // 1. Lançamento de saída (débito / expense) na conta de origem
    const [saida] = await trx('transacoes')
      .insert({
        usuario_id: usuarioId,
        conta_id: conta_origem_id,
        categoria_id: categoriaTransferencia.id,
        amount_cents,
        type: 'expense',
        date,
        descricao: `${desc} (Saída)`,
        status: 'pago',
        transferencia_id: transferenciaId,
      })
      .returning('*');

    // 2. Lançamento de entrada (crédito / income) na conta de destino
    const [entrada] = await trx('transacoes')
      .insert({
        usuario_id: usuarioId,
        conta_id: conta_destino_id,
        categoria_id: categoriaTransferencia.id,
        amount_cents,
        type: 'income',
        date,
        descricao: `${desc} (Entrada)`,
        status: 'pago',
        transferencia_id: transferenciaId,
      })
      .returning('*');

    return { saida, entrada };
  });
}

/**
 * Remove uma transação, ajustando o saldo da fatura caso estivesse vinculada.
 *
 * @param {string} usuarioId
 * @param {string} transacaoId
 * @returns {Promise<void>}
 */
export async function deleteTransaction(usuarioId, transacaoId) {
  return db.transaction(async (trx) => {
    const transacao = await trx('transacoes')
      .where({ id: transacaoId, usuario_id: usuarioId })
      .first();

    if (!transacao) {
      const error = new Error('Transação não encontrada');
      error.code = 'TRANSACTION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Se estiver vinculada a uma fatura, decrementa o valor da fatura
    if (transacao.fatura_id) {
      await trx('faturas')
        .where({ id: transacao.fatura_id })
        .decrement('valor_total_cents', transacao.amount_cents);
    }

    // Se for uma transferência, remove as duas pernas da transação
    if (transacao.transferencia_id) {
      await trx('transacoes')
        .where({ transferencia_id: transacao.transferencia_id, usuario_id: usuarioId })
        .del();
    } else {
      await trx('transacoes')
        .where({ id: transacaoId, usuario_id: usuarioId })
        .del();
    }
  });
}

