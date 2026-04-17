import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import marcacoesRoutes from './routes/marcacoes';
import ajustesRoutes from './routes/ajustes';
import exportRoutes from './routes/export';
import pushRoutes from './routes/push';
import espelhoRoutes from './routes/espelho';
import { iniciarJobsNotificacoes } from './jobs/notificacoes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176'
  ],
  credentials: true
}));
app.use(express.json());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/', (_req, res) => {
  res.json({ message: 'Ponto Backend API', status: 'running', version: '1.0.0' });
});

app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/marcacoes', marcacoesRoutes);
app.use('/api/ajustes', ajustesRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/espelho', espelhoRoutes);

app.use(errorHandler);

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  iniciarJobsNotificacoes();
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
