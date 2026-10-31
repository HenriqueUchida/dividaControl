import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas do sistema
app.use('/health', healthRouter);
app.use('/auth', authRouter);

// Tratamento para rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Rota não encontrada',
  });
});

// Middleware global de tratamento de erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Erro interno do servidor',
  });
});

export default app;

