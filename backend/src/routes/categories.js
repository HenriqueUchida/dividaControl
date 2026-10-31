import { Router } from 'express';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categoryValidator.js';
import * as categoryService from '../services/categoryService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de categorias exigem autenticação
router.use(authenticateToken);

// Listar categorias do usuário (filtro opcional ?tipo=income|expense)
router.get('/', async (req, res, next) => {
  try {
    const { tipo } = req.query;
    const categories = await categoryService.listCategories(req.user.userId, tipo);
    return res.status(200).json(categories);
  } catch (error) {
    return next(error);
  }
});

// Gerar categorias padronizadas para o usuário
router.post('/seed-defaults', async (req, res, next) => {
  try {
    const created = await categoryService.seedDefaultCategories(req.user.userId);
    return res.status(200).json({
      success: true,
      message: `${created.length} categorias padrão geradas com sucesso`,
      categories: created,
    });
  } catch (error) {
    return next(error);
  }
});

// Buscar uma categoria específica por ID
router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.user.userId, req.params.id);
    if (!category) {
      return res.status(404).json({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Categoria não encontrada',
      });
    }

    return res.status(200).json(category);
  } catch (error) {
    return next(error);
  }
});

// Cadastrar nova categoria
router.post('/', async (req, res, next) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const newCategory = await categoryService.createCategory(
      req.user.userId,
      validation.data
    );

    return res.status(201).json(newCategory);
  } catch (error) {
    return next(error);
  }
});

// Atualizar categoria existente
router.put('/:id', async (req, res, next) => {
  try {
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const updatedCategory = await categoryService.updateCategory(
      req.user.userId,
      req.params.id,
      validation.data
    );

    return res.status(200).json(updatedCategory);
  } catch (error) {
    return next(error);
  }
});

// Desativar categoria (soft-delete)
router.delete('/:id', async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.user.userId, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Categoria desativada com sucesso',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

