import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import accountsRouter from './routes/accounts.js';
import categoriesRouter from './routes/categories.js';
import cardsRouter from './routes/cards.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter from './routes/reports.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas do sistema
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/accounts', accountsRouter);
app.use('/categories', categoriesRouter);
app.use('/cards', cardsRouter);
app.use('/transactions', transactionsRouter);
app.use('/reports', reportsRouter);

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
  if (statusCode >= 500) {
    console.error('[API Error]:', err);
  }
  res.status(statusCode).json({
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Erro interno do servidor',
  });
});

export default app;

