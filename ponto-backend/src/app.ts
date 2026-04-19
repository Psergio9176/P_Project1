require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const marcacoesRoutes = require('./routes/marcacoes');
const ajustesRoutes = require('./routes/ajustes');
const exportRoutes = require('./routes/export');
const pushRoutes = require('./routes/push');
const espelhoRoutes = require('./routes/espelho');
const { iniciarJobsNotificacoes } = require('./jobs/notificacoes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://p-project1.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: allowedOrigins,
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

module.exports = app;