import { Router } from 'express';
import { registrar, syncBatch, listar, hoje } from '../controllers/marcacoesController';
import { authMiddleware, perfilMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, registrar);
router.post('/sync', authMiddleware, syncBatch);
router.get('/', authMiddleware, perfilMiddleware(['ADMIN']), listar);
router.get('/hoje', authMiddleware, hoje);

export default router;
