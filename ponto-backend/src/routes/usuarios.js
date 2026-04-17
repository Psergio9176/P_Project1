const { Router } = require('express');
const { listar, criar, atualizar, desativar } = require('../controllers/usuariosController');
const { authMiddleware, perfilMiddleware } = require('../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/', perfilMiddleware(['ADMIN']), listar);
router.post('/', perfilMiddleware(['ADMIN']), criar);
router.put('/:id', perfilMiddleware(['ADMIN']), atualizar);
router.delete('/:id', perfilMiddleware(['ADMIN']), desativar);

module.exports = router;