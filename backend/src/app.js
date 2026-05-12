import express from 'express';
import cors from 'cors';
import lancamentosRouter from './routes/lancamentos.js';
import resumos from './routes/resumos.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/lancamentos', lancamentosRouter);

app.use('/resumos', resumos)


export default app;