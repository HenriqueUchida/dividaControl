import { Router } from 'express';
import pool from '../db.js';

const router = Router();


router.get('/faturas', async (req,res)=> {
    try{
        const idCartao = req.params.id_cartao;
        const { data_ini, data_fim } = req.query;

        const[rows] = await pool.query(`
            select 
                c.id, 
                c.descricao, 
                COALESCE(sum(l.valor),0) as valor_fatura, 
                DATE_FORMAT(l.data_vencimento,  '%d/%m/%Y') as data_vencimento
            from lancamento l
            right join cartao c
            on (c.id = l.id_cartao AND
                l.data_vencimento between ? and ?)
            where l.id_conta is null
            group by c.id, l.data_vencimento`,
            [data_ini, data_fim]
            //[idCartao]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({erro: 'Erro ao buscar informações'})
    }
});




export default router;