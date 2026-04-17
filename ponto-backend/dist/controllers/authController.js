"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const login = async (req, res) => {
    try {
        const { cpf, senha } = req.body;
        if (!cpf || !senha) {
            res.status(400).json({ error: 'CPF e senha são obrigatórios' });
            return;
        }
        const usuario = await database_1.default.usuario.findUnique({
            where: { cpf },
            include: { unidade: { include: { empresa: true } } }
        });
        if (!usuario) {
            res.status(401).json({ error: 'CPF ou senha incorretos' });
            return;
        }
        if (!usuario.ativo) {
            res.status(401).json({ error: 'Usuário desativado' });
            return;
        }
        const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senhaHash);
        if (!senhaValida) {
            res.status(401).json({ error: 'CPF ou senha incorretos' });
            return;
        }
        const payload = {
            id: usuario.id,
            cpf: usuario.cpf,
            nome: usuario.nome,
            perfil: usuario.perfil,
            tipoJornada: usuario.tipoJornada,
            unidadeId: usuario.unidadeId
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: usuario.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        res.json({
            accessToken,
            refreshToken,
            usuario: payload
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao realizar login' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token é obrigatório' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        const usuario = await database_1.default.usuario.findUnique({
            where: { id: decoded.id }
        });
        if (!usuario || !usuario.ativo) {
            res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
            return;
        }
        const payload = {
            id: usuario.id,
            cpf: usuario.cpf,
            nome: usuario.nome,
            perfil: usuario.perfil,
            tipoJornada: usuario.tipoJornada,
            unidadeId: usuario.unidadeId
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ error: 'Refresh token inválido' });
    }
};
exports.refresh = refresh;
const logout = (_req, res) => {
    res.json({ message: 'Logout realizado com sucesso' });
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        if (!req.usuario) {
            res.status(401).json({ error: 'Não autenticado' });
            return;
        }
        const usuario = await database_1.default.usuario.findUnique({
            where: { id: req.usuario.id },
            include: {
                unidade: { include: { empresa: true } }
            }
        });
        if (!usuario) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.json({
            id: usuario.id,
            cpf: usuario.cpf,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            tipoJornada: usuario.tipoJornada,
            unidade: usuario.unidade,
            empresa: usuario.unidade.empresa
        });
    }
    catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
};
exports.me = me;
//# sourceMappingURL=authController.js.map