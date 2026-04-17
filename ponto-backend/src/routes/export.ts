import { Router } from 'express';
import { exportarMarcacoes } from '../controllers/exportController';
import { authMiddleware, perfilMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/marcacoes', authMiddleware, perfilMiddleware(['ADMIN']), exportarMarcacoes);

export default router;
