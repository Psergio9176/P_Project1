"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exportController_1 = require("../controllers/exportController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/marcacoes', auth_1.authMiddleware, (0, auth_1.perfilMiddleware)(['ADMIN']), exportController_1.exportarMarcacoes);
exports.default = router;
//# sourceMappingURL=export.js.map