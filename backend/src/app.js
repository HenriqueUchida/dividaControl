import express from 'express';
import cors from 'cors';
import lancamentosRouter from './routes/lancamentos.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/lancamentos', lancamentosRouter);


export default app;