const { Request, Response } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AuthenticatedRequest } = require('../middlewares/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

module.exports.login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
      res.status(400).json({ error: 'CPF e senha são obrigatórios' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
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

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

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

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: usuario.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({
      accessToken,
      refreshToken,
      usuario: payload
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

module.exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token é obrigatório' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const usuario = await prisma.usuario.findUnique({
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

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido' });
  }
};

module.exports.logout = (_req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
};

module.exports.me = async (req, res) => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
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
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};