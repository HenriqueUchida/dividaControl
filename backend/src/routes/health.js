import { Router } from 'express';
import db from '../db/knex.js';

const router = Router();

// Verificação simples de saúde da aplicação
router.get('/', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// Verificação de conectividade com o banco de dados
router.get('/db', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    return res.status(200).json({ status: 'ok', database: 'ok' });
  } catch (error) {
    return res.status(503).json({
      code: 'DATABASE_UNAVAILABLE',
      message: 'Banco de dados indisponível',
    });
  }
});

export default router;

