import { Router } from 'express';
import { listar, criar, atualizar, desativar } from '../controllers/usuariosController';
import { authMiddleware, perfilMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', perfilMiddleware(['ADMIN']), listar);
router.post('/', perfilMiddleware(['ADMIN']), criar);
router.put('/:id', perfilMiddleware(['ADMIN']), atualizar);
router.delete('/:id', perfilMiddleware(['ADMIN']), desativar);

export default router;
