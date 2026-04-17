const { Router } = require('express');
const { getVapidPublicKey, subscribe, unsubscribe } = require('../controllers/pushController');
const { authMiddleware } = require('../middlewares/auth');

const router = Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', authMiddleware, subscribe);
router.delete('/unsubscribe', authMiddleware, unsubscribe);

module.exports = router;