"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.desativar = exports.atualizar = exports.criar = exports.listar = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const listar = async (_req, res) => {
    try {
        const usuarios = await database_1.default.usuario.findMany({
            where: { ativo: true },
            include: { unidade: { include: { empresa: true } } },
            orderBy: { nome: 'asc' }
        });
        res.json(usuarios.map(u => ({
            id: u.id,
            cpf: u.cpf,
            nome: u.nome,
            email: u.email,
            perfil: u.perfil,
            tipoJornada: u.tipoJornada,
            ativo: u.ativo,
            unidade: u.unidade
        })));
    }
    catch (error) {
        console.error('Listar usuarios error:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};
exports.listar = listar;
const criar = async (req, res) => {
    try {
        const { cpf, nome, email, senha, perfil, tipoJornada, unidadeId } = req.body;
        if (!cpf || !nome || !senha || !unidadeId) {
            res.status(400).json({ error: 'CPF, nome, senha e unidade são obrigatórios' });
            return;
        }
        const existente = await database_1.default.usuario.findUnique({ where: { cpf } });
        if (existente) {
            res.status(400).json({ error: 'CPF já cadastrado' });
            return;
        }
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const usuario = await database_1.default.usuario.create({
            data: {
                cpf,
                nome,
                email,
                senhaHash,
                perfil: perfil || 'COLABORADOR',
                tipoJornada: tipoJornada || 'PADRAO',
                unidadeId
            },
            include: { unidade: true }
        });
        res.status(201).json({
            id: usuario.id,
            cpf: usuario.cpf,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            tipoJornada: usuario.tipoJornada,
            ativo: usuario.ativo,
            unidade: usuario.unidade
        });
    }
    catch (error) {
        console.error('Criar usuario error:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
exports.criar = criar;
const atualizar = async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, email, senha, perfil, tipoJornada, ativo } = req.body;
        const data = {};
        if (nome)
            data.nome = nome;
        if (email !== undefined)
            data.email = email;
        if (perfil)
            data.perfil = perfil;
        if (tipoJornada)
            data.tipoJornada = tipoJornada;
        if (ativo !== undefined)
            data.ativo = ativo;
        if (senha)
            data.senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const usuario = await database_1.default.usuario.update({
            where: { id },
            data,
            include: { unidade: true }
        });
        res.json({
            id: usuario.id,
            cpf: usuario.cpf,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            tipoJornada: usuario.tipoJornada,
            ativo: usuario.ativo,
            unidade: usuario.unidade
        });
    }
    catch (error) {
        console.error('Atualizar usuario error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
exports.atualizar = atualizar;
const desativar = async (req, res) => {
    try {
        const id = req.params.id;
        await database_1.default.usuario.update({
            where: { id },
            data: { ativo: false }
        });
        res.json({ message: 'Usuário desativado com sucesso' });
    }
    catch (error) {
        console.error('Desativar usuario error:', error);
        res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
};
exports.desativar = desativar;
//# sourceMappingURL=usuariosController.js.map