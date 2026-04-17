const { Request, Response } = require('express');
const crypto = require('crypto');
const prisma = require('../config/database');
const { gerarEspelhoPDF } = require('../services/espelhoService');
const { AuthenticatedRequest } = require('../middlewares/auth');

module.exports.gerarEspelho = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const mes = req.params.mes;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const { pdf, hash } = await gerarEspelhoPDF(usuarioId, mes);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="espelho-${mes}-${usuario.cpf}.pdf"`);
    
    pdf.pipe(res);
    pdf.end();
  } catch (error) {
    console.error('Gerar espelho error:', error);
    res.status(500).json({ error: 'Erro ao gerar espelho de ponto' });
  }
};

module.exports.assinarEspelho = async (req, res) => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const usuarioId = req.params.usuarioId;
    const mes = req.params.mes;

    if (req.usuario.id !== usuarioId && req.usuario.perfil !== 'ADMIN') {
      res.status(403).json({ error: 'Você só pode assinar seu próprio espelho' });
      return;
    }

    const existente = await prisma.assinaturaPonto.findUnique({
      where: { usuarioId_mesReferencia: { usuarioId, mesReferencia: mes } }
    });

    if (existente) {
      res.status(400).json({ error: 'Espelho já foi assinado' });
      return;
    }

    const { pdf, hash } = await gerarEspelhoPDF(usuarioId, mes);
    pdf.end();

    const assinatura = await prisma.assinaturaPonto.create({
      data: {
        usuarioId,
        mesReferencia: mes,
        hashEspelho: hash,
        assinadoEm: new Date()
      }
    });

    res.json({
      message: 'Espelho assinado com sucesso',
      assinatura: {
        mesReferencia: assinatura.mesReferencia,
        assinadoEm: assinatura.assinadoEm,
        hashEspelho: assinatura.hashEspelho
      }
    });
  } catch (error) {
    console.error('Assinar espelho error:', error);
    res.status(500).json({ error: 'Erro ao assinar espelho de ponto' });
  }
};

module.exports.verificarAssinatura = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    const mes = req.params.mes;

    const assinatura = await prisma.assinaturaPonto.findUnique({
      where: { usuarioId_mesReferencia: { usuarioId, mesReferencia: mes } }
    });

    res.json({
      assinado: !!assinatura,
      assinatura: assinatura ? {
        mesReferencia: assinatura.mesReferencia,
        assinadoEm: assinatura.assinadoEm,
        hashEspelho: assinatura.hashEspelho
      } : null
    });
  } catch (error) {
    console.error('Verificar assinatura error:', error);
    res.status(500).json({ error: 'Erro ao verificar assinatura' });
  }
};