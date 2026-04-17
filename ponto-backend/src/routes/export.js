const { Router } = require('express');
const { exportarMarcacoes } = require('../controllers/exportController');
const { authMiddleware, perfilMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/marcacoes', authMiddleware, perfilMiddleware(['ADMIN']), exportarMarcacoes);

module.exports = router;