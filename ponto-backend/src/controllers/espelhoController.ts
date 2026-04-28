import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import { gerarEspelhoPDF } from '../services/espelhoService';
import { AuthenticatedRequest } from '../middlewares/auth';

export const gerarEspelho = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.params.usuarioId as string;
    const mes = req.params.mes as string;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const { pdf, hash } = await gerarEspelhoPDF(usuarioId, mes);

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);
      pdf.end();
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="espelho-${mes}-${usuario.cpf}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Gerar espelho error:', error);
    res.status(500).json({ error: 'Erro ao gerar espelho de ponto' });
  }
};

export const assinarEspelho = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const usuarioId = req.params.usuarioId as string;
    const mes = req.params.mes as string;

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

    const { hash } = await gerarEspelhoPDF(usuarioId, mes);

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

export const verificarAssinatura = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.params.usuarioId as string;
    const mes = req.params.mes as string;

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
