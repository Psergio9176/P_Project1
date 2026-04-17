"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marcacoesController_1 = require("../controllers/marcacoesController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authMiddleware, marcacoesController_1.registrar);
router.post('/sync', auth_1.authMiddleware, marcacoesController_1.syncBatch);
router.get('/', auth_1.authMiddleware, (0, auth_1.perfilMiddleware)(['ADMIN']), marcacoesController_1.listar);
router.get('/hoje', auth_1.authMiddleware, marcacoesController_1.hoje);
exports.default = router;
//# sourceMappingURL=marcacoes.js.map