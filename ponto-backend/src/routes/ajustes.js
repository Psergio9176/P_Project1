const { Router } = require('express');
const { criarAjuste, listarAjustes, meusAjustes, avaliarAjuste } = require('../controllers/ajustesController');
const { authMiddleware, perfilMiddleware } = require('../middlewares/auth');

const router = Router();

router.post('/', authMiddleware, criarAjuste);
router.get('/', authMiddleware, perfilMiddleware(['ADMIN']), listarAjustes);
router.get('/meus', authMiddleware, meusAjustes);
router.put('/:id/avaliar', authMiddleware, perfilMiddleware(['ADMIN']), avaliarAjuste);

module.exports = router;