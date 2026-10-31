import { Router } from 'express';
import {
  createAccountSchema,
  updateAccountSchema,
} from '../validators/accountValidator.js';
import * as accountService from '../services/accountService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de contas exigem autenticação
router.use(authenticateToken);

// Listar contas ativas do usuário
router.get('/', async (req, res, next) => {
  try {
    const accounts = await accountService.listAccounts(req.user.userId);
    return res.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
});

// Buscar uma conta específica por ID
router.get('/:id', async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(req.user.userId, req.params.id);
    if (!account) {
      return res.status(404).json({
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Conta bancária não encontrada',
      });
    }

    return res.status(200).json(account);
  } catch (error) {
    return next(error);
  }
});

// Cadastrar nova conta bancária
router.post('/', async (req, res, next) => {
  try {
    const validation = createAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const newAccount = await accountService.createAccount(
      req.user.userId,
      validation.data
    );

    return res.status(201).json(newAccount);
  } catch (error) {
    return next(error);
  }
});

// Atualizar conta existente
router.put('/:id', async (req, res, next) => {
  try {
    const validation = updateAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const updatedAccount = await accountService.updateAccount(
      req.user.userId,
      req.params.id,
      validation.data
    );

    return res.status(200).json(updatedAccount);
  } catch (error) {
    return next(error);
  }
});

// Desativar conta (soft-delete)
router.delete('/:id', async (req, res, next) => {
  try {
    await accountService.deleteAccount(req.user.userId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Conta bancária desativada com sucesso',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

