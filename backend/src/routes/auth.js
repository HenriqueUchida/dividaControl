import { Router } from 'express';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import * as authService from '../services/authService.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Registro de novo usuário
router.post('/register', async (req, res, next) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { user, token } = await authService.registerUser(validation.data);
    return res.status(201).json({ user, token });
  } catch (error) {
    return next(error);
  }
});

// Login de usuário existente
router.post('/login', async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0].message,
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { user, token } = await authService.loginUser(validation.data);
    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
});

// Perfil do usuário logado (rota protegida)
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    return res.status(200).json({
      user: authService.sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

