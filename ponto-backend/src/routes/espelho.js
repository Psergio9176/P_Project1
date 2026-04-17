const { Router } = require('express');
const { gerarEspelho, assinarEspelho, verificarAssinatura } = require('../controllers/espelhoController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/:usuarioId/:mes', authMiddleware, gerarEspelho);
router.post('/:usuarioId/:mes/assinar', authMiddleware, assinarEspelho);
router.get('/:usuarioId/:mes/verificar', authMiddleware, verificarAssinatura);

module.exports = router;