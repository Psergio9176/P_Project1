"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ajustesController_1 = require("../controllers/ajustesController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authMiddleware, ajustesController_1.criarAjuste);
router.get('/', auth_1.authMiddleware, (0, auth_1.perfilMiddleware)(['ADMIN']), ajustesController_1.listarAjustes);
router.get('/meus', auth_1.authMiddleware, ajustesController_1.meusAjustes);
router.put('/:id/avaliar', auth_1.authMiddleware, (0, auth_1.perfilMiddleware)(['ADMIN']), ajustesController_1.avaliarAjuste);
exports.default = router;
//# sourceMappingURL=ajustes.js.map