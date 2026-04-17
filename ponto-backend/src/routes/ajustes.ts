import { Router } from 'express';
import { criarAjuste, listarAjustes, meusAjustes, avaliarAjuste } from '../controllers/ajustesController';
import { authMiddleware, perfilMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, criarAjuste);
router.get('/', authMiddleware, perfilMiddleware(['ADMIN']), listarAjustes);
router.get('/meus', authMiddleware, meusAjustes);
router.put('/:id/avaliar', authMiddleware, perfilMiddleware(['ADMIN']), avaliarAjuste);

export default router;
