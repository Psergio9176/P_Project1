import { Router } from 'express';
import { gerarEspelho, assinarEspelho, verificarAssinatura } from '../controllers/espelhoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/:usuarioId/:mes', authMiddleware, gerarEspelho);
router.post('/:usuarioId/:mes/assinar', authMiddleware, assinarEspelho);
router.get('/:usuarioId/:mes/verificar', authMiddleware, verificarAssinatura);

export default router;
