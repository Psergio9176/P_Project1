"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuariosController_1 = require("../controllers/usuariosController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', (0, auth_1.perfilMiddleware)(['ADMIN']), usuariosController_1.listar);
router.post('/', (0, auth_1.perfilMiddleware)(['ADMIN']), usuariosController_1.criar);
router.put('/:id', (0, auth_1.perfilMiddleware)(['ADMIN']), usuariosController_1.atualizar);
router.delete('/:id', (0, auth_1.perfilMiddleware)(['ADMIN']), usuariosController_1.desativar);
exports.default = router;
//# sourceMappingURL=usuarios.js.map