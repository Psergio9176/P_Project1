"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfilMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }
    const token = authHeader.substring(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.usuario = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};
exports.authMiddleware = authMiddleware;
const perfilMiddleware = (perfis) => {
    return (req, res, next) => {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        if (!perfis.includes(req.usuario.perfil)) {
            res.status(403).json({ error: 'Acesso negado' });
            return;
        }
        next();
    };
};
exports.perfilMiddleware = perfilMiddleware;
//# sourceMappingURL=auth.js.map