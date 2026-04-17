import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

export const login = async (req: Request, res: Response): Promise<void> => {
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

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token é obrigatório' });
      return;
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };

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

export const logout = (_req: Request, res: Response): void => {
  res.json({ message: 'Logout realizado com sucesso' });
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
