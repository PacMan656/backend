import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { PrismaClient } from '@prisma/client';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import errorHandler from './middlewares/error';
import { logger } from './utils/logger';

const app = express();
export const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 3000;

// CORS restrito (ajuste o origin pro seu front)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Health
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// 404 + erros
app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`API running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
