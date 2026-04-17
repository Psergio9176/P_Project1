"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map