"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middlewares/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const marcacoes_1 = __importDefault(require("./routes/marcacoes"));
const ajustes_1 = __importDefault(require("./routes/ajustes"));
const export_1 = __importDefault(require("./routes/export"));
const push_1 = __importDefault(require("./routes/push"));
const espelho_1 = __importDefault(require("./routes/espelho"));
const notificacoes_1 = require("./jobs/notificacoes");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176'
    ],
    credentials: true
}));
app.use(express_1.default.json());
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.get('/', (_req, res) => {
    res.json({ message: 'Ponto Backend API', status: 'running', version: '1.0.0' });
});
app.use('/api/auth', loginLimiter, auth_1.default);
app.use('/api/usuarios', usuarios_1.default);
app.use('/api/marcacoes', marcacoes_1.default);
app.use('/api/ajustes', ajustes_1.default);
app.use('/api/export', export_1.default);
app.use('/api/push', push_1.default);
app.use('/api/espelho', espelho_1.default);
app.use(errorHandler_1.errorHandler);
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    (0, notificacoes_1.iniciarJobsNotificacoes)();
}
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map