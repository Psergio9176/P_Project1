const { Router } = require('express');
const { registrar, syncBatch, listar, hoje } = require('../controllers/marcacoesController');
const { authMiddleware, perfilMiddleware } = require('../middlewares/auth');

const router = Router();

router.post('/', authMiddleware, registrar);
router.post('/sync', authMiddleware, syncBatch);
router.get('/', authMiddleware, perfilMiddleware(['ADMIN']), listar);
router.get('/hoje', authMiddleware, hoje);

module.exports = router;