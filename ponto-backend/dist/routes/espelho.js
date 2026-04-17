"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const espelhoController_1 = require("../controllers/espelhoController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/:usuarioId/:mes', auth_1.authMiddleware, espelhoController_1.gerarEspelho);
router.post('/:usuarioId/:mes/assinar', auth_1.authMiddleware, espelhoController_1.assinarEspelho);
router.get('/:usuarioId/:mes/verificar', auth_1.authMiddleware, espelhoController_1.verificarAssinatura);
exports.default = router;
//# sourceMappingURL=espelho.js.map