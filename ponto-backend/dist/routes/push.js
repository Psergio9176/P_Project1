"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pushController_1 = require("../controllers/pushController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/vapid-public-key', pushController_1.getVapidPublicKey);
router.post('/subscribe', auth_1.authMiddleware, pushController_1.subscribe);
router.delete('/unsubscribe', auth_1.authMiddleware, pushController_1.unsubscribe);
exports.default = router;
//# sourceMappingURL=push.js.map