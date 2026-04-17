import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

export const listar = async (_req: Request, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.usuario.findMany({
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
  } catch (error) {
    console.error('Listar usuarios error:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

export const criar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cpf, nome, email, senha, perfil, tipoJornada, unidadeId } = req.body;

    if (!cpf || !nome || !senha || !unidadeId) {
      res.status(400).json({ error: 'CPF, nome, senha e unidade são obrigatórios' });
      return;
    }

    const existente = await prisma.usuario.findUnique({ where: { cpf } });
    if (existente) {
      res.status(400).json({ error: 'CPF já cadastrado' });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
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
  } catch (error) {
    console.error('Criar usuario error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

export const atualizar = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { nome, email, senha, perfil, tipoJornada, ativo } = req.body;

    const data: Record<string, unknown> = {};
    if (nome) data.nome = nome;
    if (email !== undefined) data.email = email;
    if (perfil) data.perfil = perfil;
    if (tipoJornada) data.tipoJornada = tipoJornada;
    if (ativo !== undefined) data.ativo = ativo;
    if (senha) data.senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.update({
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
      unidade: (usuario as unknown as { unidade: unknown }).unidade
    });
  } catch (error) {
    console.error('Atualizar usuario error:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

export const desativar = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    await prisma.usuario.update({
      where: { id },
      data: { ativo: false }
    });

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Desativar usuario error:', error);
    res.status(500).json({ error: 'Erro ao desativar usuário' });
  }
};
