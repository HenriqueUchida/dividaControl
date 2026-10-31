import { verifyToken } from '../services/authService.js';

/**
 * Middleware para validar o token JWT nas rotas protegidas.
 * Injeta os dados do usuário autenticado em `req.user`.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token de autenticação não fornecido',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Formato de cabeçalho inválido. Use: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token de autenticação inválido ou expirado',
    });
  }
}

