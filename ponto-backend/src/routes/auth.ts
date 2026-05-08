import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refresh, logout, me } from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;
