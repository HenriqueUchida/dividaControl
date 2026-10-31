import { Router } from 'express';
import {
  createCardSchema,
  updateCardSchema,
} from '../validators/cardValidator.js';
import * as cardService from '../services/cardService.js';
import * as invoiceService from '../services/invoiceService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de cartões exigem autenticação
router.use(authenticateToken);

// Listar cartões do usuário
router.get('/', async (req, res, next) => {
  try {
    const cards = await cardService.listCards(req.user.userId);
    return res.status(200).json(cards);
  } catch (error) {
    return next(error);
  }
});

// Buscar um cartão por ID
router.get('/:id', async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.user.userId, req.params.id);
    if (!card) {
      return res.status(404).json({
        code: 'CARD_NOT_FOUND',
        message: 'Cartão não encontrado',
      });
    }

    return res.status(200).json(card);
  } catch (error) {
    return next(error);
  }
});

// Cadastrar novo cartão
router.post('/', async (req, res, next) => {
  try {
    const validation = createCardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const newCard = await cardService.createCard(
      req.user.userId,
      validation.data
    );

    return res.status(201).json(newCard);
  } catch (error) {
    return next(error);
  }
});

// Atualizar cartão
router.put('/:id', async (req, res, next) => {
  try {
    const validation = updateCardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const updatedCard = await cardService.updateCard(
      req.user.userId,
      req.params.id,
      validation.data
    );

    return res.status(200).json(updatedCard);
  } catch (error) {
    return next(error);
  }
});

// Desativar cartão (soft-delete)
router.delete('/:id', async (req, res, next) => {
  try {
    await cardService.deleteCard(req.user.userId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Cartão desativado com sucesso',
    });
  } catch (error) {
    return next(error);
  }
});

// Listar faturas de um cartão de crédito
router.get('/:id/invoices', async (req, res, next) => {
  try {
    const card = await cardService.getCardById(req.user.userId, req.params.id);
    if (!card) {
      return res.status(404).json({
        code: 'CARD_NOT_FOUND',
        message: 'Cartão não encontrado',
      });
    }

    if (card.tipo !== 'CREDITO') {
      return res.status(400).json({
        code: 'INVALID_CARD_TYPE',
        message: 'Apenas cartões de crédito possuem faturas',
      });
    }

    const invoices = await invoiceService.listInvoicesByCard(req.user.userId, req.params.id);
    return res.status(200).json(invoices);
  } catch (error) {
    return next(error);
  }
});

export default router;

