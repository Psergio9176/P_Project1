"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = exports.criarAuditLog = exports.Acao = void 0;
const database_1 = __importDefault(require("../config/database"));
var Acao;
(function (Acao) {
    Acao["CREATE_MARCACAO"] = "CREATE_MARCACAO";
    Acao["CREATE_AJUSTE"] = "CREATE_AJUSTE";
    Acao["AJUSTE_APROVADO"] = "AJUSTE_APROVADO";
    Acao["AJUSTE_REJEITADO"] = "AJUSTE_REJEITADO";
    Acao["ESPELHO_GERADO"] = "ESPELHO_GERADO";
    Acao["ESPELHO_ASSINADO"] = "ESPELHO_ASSINADO";
    Acao["USUARIO_CRIADO"] = "USUARIO_CRIADO";
    Acao["USUARIO_ATUALIZADO"] = "USUARIO_ATUALIZADO";
    Acao["USUARIO_DESATIVADO"] = "USUARIO_DESATIVADO";
    Acao["LOGIN"] = "LOGIN";
    Acao["LOGIN_FALHO"] = "LOGIN_FALHO";
    Acao["PUSH_SUBSCRIBE"] = "PUSH_SUBSCRIBE";
    Acao["PUSH_UNSUBSCRIBE"] = "PUSH_UNSUBSCRIBE";
})(Acao || (exports.Acao = Acao = {}));
const criarAuditLog = async (req, acao, entidade, entidadeId, dados) => {
    try {
        await database_1.default.auditLog.create({
            data: {
                usuarioId: req.usuario?.id || 'sistema',
                acao,
                entidade,
                entidadeId,
                dados: dados,
                ip: req.ip || req.socket.remoteAddress || null,
                userAgent: req.headers['user-agent'] || null,
            },
        });
    }
    catch (error) {
        console.error('Erro ao criar audit log:', error);
    }
};
exports.criarAuditLog = criarAuditLog;
const auditMiddleware = (acao, entidade) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const paramsId = req.params.id;
                const entidadeId = (Array.isArray(paramsId) ? paramsId[0] : paramsId) ||
                    (typeof data === 'object' && data !== null ? data.id : 'unknown');
                (0, exports.criarAuditLog)(req, acao, entidade, entidadeId, data);
            }
            return originalJson(data);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
//# sourceMappingURL=auditLog.js.map