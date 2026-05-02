import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                l.id,
                l.descricao,
                l.valor,
                l.tipo,
                DATE_FORMAT(l.data_lancamento, '%d/%m/%Y') AS data_lancamento,
                DATE_FORMAT(l.data_vencimento,  '%d/%m/%Y') AS data_vencimento,
                DATE_FORMAT(l.data_pagamento,  '%d/%m/%Y') AS data_pagamento,
                l.observacao,
                l.id_parcela,
                l.parcelas,
                c.descricao  AS categoria,
                ca.descricao AS cartao,
                co.descricao AS conta
            FROM lancamento l
            LEFT JOIN categoria c  ON c.id  = l.id_categoria
            LEFT JOIN cartao   ca  ON ca.id = l.id_cartao
            LEFT JOIN conta    co  ON co.id = l.id_conta
            ORDER BY l.data_lancamento DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar lançamentos' });
    }
});

export default router;