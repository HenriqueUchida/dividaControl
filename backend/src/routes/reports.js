import { Router } from 'express';
import * as reportService from '../services/reportService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de relatórios exigem autenticação
router.use(authenticateToken);

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

// Obter o mês atual no formato YYYY-MM
function getCurrentMonth() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Saldo consolidado das contas bancárias
router.get('/balances', async (req, res, next) => {
  try {
    const balances = await reportService.getAccountBalances(req.user.userId);
    return res.status(200).json(balances);
  } catch (error) {
    return next(error);
  }
});

// Resumo mensal de receitas vs despesas
router.get('/summary', async (req, res, next) => {
  try {
    const month = req.query.month ? String(req.query.month) : getCurrentMonth();

    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'O parâmetro month deve estar no formato AAAA-MM (ex: 2026-10)',
      });
    }

    const summary = await reportService.getMonthlySummary(req.user.userId, month);
    return res.status(200).json(summary);
  } catch (error) {
    return next(error);
  }
});

// Despesas do mês agrupadas por categoria
router.get('/by-category', async (req, res, next) => {
  try {
    const month = req.query.month ? String(req.query.month) : getCurrentMonth();

    if (!MONTH_REGEX.test(month)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'O parâmetro month deve estar no formato AAAA-MM (ex: 2026-10)',
      });
    }

    const expenses = await reportService.getExpensesByCategory(req.user.userId, month);
    return res.status(200).json(expenses);
  } catch (error) {
    return next(error);
  }
});

export default router;

