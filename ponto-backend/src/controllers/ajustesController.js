const { Request, Response } = require('express');
const prisma = require('../config/database');
const { AuthenticatedRequest } = require('../middlewares/auth');

module.exports.criarAjuste = async (req, res) => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { tipo, dataHoraOriginal, dataHoraAjuste, justificativa } = req.body;

    if (!tipo || !dataHoraAjuste || !justificativa) {
      res.status(400).json({ error: 'Tipo, data/hora do ajuste e justificativa são obrigatórios' });
      return;
    }

    if (justificativa.length < 10) {
      res.status(400).json({ error: 'Justificativa deve ter pelo menos 10 caracteres' });
      return;
    }

    const ajuste = await prisma.ajusteMarcacao.create({
      data: {
        usuarioId: req.usuario.id,
        tipo,
        dataHoraOriginal: dataHoraOriginal ? new Date(dataHoraOriginal) : null,
        dataHoraAjuste: new Date(dataHoraAjuste),
        justificativa,
        aprovado: null
      }
    });

    res.status(201).json(ajuste);
  } catch (error) {
    console.error('Criar ajuste error:', error);
    res.status(500).json({ error: 'Erro ao criar ajuste' });
  }
};

module.exports.listarAjustes = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};

    if (status === 'pendente') where.aprovado = null;
    else if (status === 'aprovado') where.aprovado = true;
    else if (status === 'rejeitado') where.aprovado = false;

    const ajustes = await prisma.ajusteMarcacao.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, cpf: true, unidade: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ajustes);
  } catch (error) {
    console.error('Listar ajustes error:', error);
    res.status(500).json({ error: 'Erro ao listar ajustes' });
  }
};

module.exports.meusAjustes = async (req, res) => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const ajustes = await prisma.ajusteMarcacao.findMany({
      where: { usuarioId: req.usuario.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ajustes);
  } catch (error) {
    console.error('Meus ajustes error:', error);
    res.status(500).json({ error: 'Erro ao listar ajustes' });
  }
};

module.exports.avaliarAjuste = async (req, res) => {
  try {
    const id = req.params.id;
    const { aprovado } = req.body;

    if (aprovado !== true && aprovado !== false) {
      res.status(400).json({ error: 'Campo "aprovado" deve ser true ou false' });
      return;
    }

    const ajuste = await prisma.ajusteMarcacao.findUnique({
      where: { id }
    });

    if (!ajuste) {
      res.status(404).json({ error: 'Ajuste não encontrado' });
      return;
    }

    if (ajuste.aprovado !== null) {
      res.status(400).json({ error: 'Ajuste já foi avaliado' });
      return;
    }

    const ajusteAtualizado = await prisma.ajusteMarcacao.update({
      where: { id },
      data: { aprovado }
    });

    if (aprovado) {
      await prisma.marcacao.create({
        data: {
          usuarioId: ajuste.usuarioId,
          tipo: ajuste.tipo,
          dataHoraUtc: ajuste.dataHoraAjuste,
          dataHoraLocal: ajuste.dataHoraAjuste,
          latitude: 0,
          longitude: 0,
          offline: false
        }
      });
    }

    res.json(ajusteAtualizado);
  } catch (error) {
    console.error('Avaliar ajuste error:', error);
    res.status(500).json({ error: 'Erro ao avaliar ajuste' });
  }
};