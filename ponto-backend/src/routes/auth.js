const { Router } = require('express');
const { login, refresh, logout, me } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

module.exports = router;