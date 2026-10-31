import { Router } from 'express';
import {
  createTransactionSchema,
  transferSchema,
} from '../validators/transactionValidator.js';
import * as transactionService from '../services/transactionService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de transações exigem autenticação
router.use(authenticateToken);

// Extrato de transações com filtros parametrizados
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, contaId, cartaoId, categoriaId, type, status } = req.query;

    const transactions = await transactionService.listTransactions(req.user.userId, {
      startDate,
      endDate,
      contaId,
      cartaoId,
      categoriaId,
      type,
      status,
    });

    return res.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
});

// Cadastrar nova transação (receita ou despesa)
router.post('/', async (req, res, next) => {
  try {
    const validation = createTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const transaction = await transactionService.createTransaction(
      req.user.userId,
      validation.data
    );

    return res.status(201).json(transaction);
  } catch (error) {
    return next(error);
  }
});

// Transferência atômica entre contas
router.post('/transfer', async (req, res, next) => {
  try {
    const validation = transferSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const result = await transactionService.createTransfer(
      req.user.userId,
      validation.data
    );

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

// Excluir transação
router.delete('/:id', async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.user.userId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Transação excluída com sucesso',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

