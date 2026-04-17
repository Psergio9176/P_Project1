import { Request, Response } from 'express';
import { TipoMarcacao, TipoJornada } from '@prisma/client';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middlewares/auth';

const ORDEM_MARCACOES_PADRAO: TipoMarcacao[] = ['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'];
const ORDEM_MARCACOES_REDUZIDA: TipoMarcacao[] = ['ENTRADA', 'SAIDA'];

const getProximaMarcacao = (marcacoes: TipoMarcacao[], tipoJornada: TipoJornada): TipoMarcacao | null => {
  const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
  
  if (marcacoes.length === 0) {
    return ordem[0];
  }
  
  const ultimoTipo = marcacoes[marcacoes.length - 1];
  const ultimoIndex = ordem.indexOf(ultimoTipo);
  
  if (ultimoIndex === -1 || ultimoIndex === ordem.length - 1) {
    return null;
  }
  
  return ordem[ultimoIndex + 1];
};

export const registrar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { tipo, dataHoraUtc, dataHoraLocal, latitude, longitude, acuraciaGps, userAgent, offline } = req.body;

    if (!tipo || !dataHoraUtc || !dataHoraLocal || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Dados incompletos para registro de marcação' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const dataReferencia = new Date(dataHoraLocal);
    const inicioDia = new Date(dataReferencia);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(dataReferencia);
    fimDia.setHours(23, 59, 59, 999);

    const marcacoesDia = await prisma.marcacao.findMany({
      where: {
        usuarioId: req.usuario.id,
        dataHoraLocal: { gte: inicioDia, lte: fimDia }
      },
      orderBy: { dataHoraLocal: 'asc' }
    });

    const tiposExistentes = marcacoesDia.map(m => m.tipo);

    if (tiposExistentes.includes(tipo)) {
      res.status(400).json({ error: `Já existe marcação de ${tipo} para este dia` });
      return;
    }

    const tipoJornada = usuario.tipoJornada as TipoJornada;
    const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
    
    const esperado = getProximaMarcacao(tiposExistentes, tipoJornada);
    if (esperado && esperado !== tipo) {
      res.status(400).json({ error: `Esperado registro de ${esperado}` });
      return;
    }

    const marcacao = await prisma.marcacao.create({
      data: {
        usuarioId: req.usuario.id,
        tipo,
        dataHoraUtc: new Date(dataHoraUtc),
        dataHoraLocal: new Date(dataHoraLocal),
        latitude,
        longitude,
        acuraciaGps,
        userAgent,
        offline: offline || false
      }
    });

    res.status(201).json({
      id: marcacao.id,
      tipo: marcacao.tipo,
      dataHoraLocal: marcacao.dataHoraLocal,
      latitude: marcacao.latitude,
      longitude: marcacao.longitude,
      comprovante: {
        tipo,
        dataHora: marcacao.dataHoraLocal,
        location: `https://www.google.com/maps?q=${latitude},${longitude}`
      }
    });
  } catch (error) {
    console.error('Registrar marcacao error:', error);
    res.status(500).json({ error: 'Erro ao registrar marcação' });
  }
};

export const syncBatch = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const { marcacoes } = req.body;

    if (!Array.isArray(marcacoes) || marcacoes.length === 0) {
      res.status(400).json({ error: 'Array de marcações é obrigatório' });
      return;
    }

    const resultados = [];

    for (const m of marcacoes) {
      try {
        const existente = await prisma.marcacao.findFirst({
          where: {
            usuarioId: req.usuario.id,
            tipo: m.tipo,
            dataHoraLocal: {
              gte: new Date(new Date(m.dataHoraLocal).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(m.dataHoraLocal).setHours(23, 59, 59, 999))
            }
          }
        });

        if (existente) {
          resultados.push({ ...m, sucesso: false, erro: 'Já existe marcação para este dia' });
          continue;
        }

        const marcacao = await prisma.marcacao.create({
          data: {
            usuarioId: req.usuario.id,
            tipo: m.tipo,
            dataHoraUtc: new Date(m.dataHoraUtc),
            dataHoraLocal: new Date(m.dataHoraLocal),
            latitude: m.latitude,
            longitude: m.longitude,
            acuraciaGps: m.acuraciaGps,
            userAgent: m.userAgent,
            offline: true,
            sincronizado: true
          }
        });

        resultados.push({ ...m, sucesso: true, id: marcacao.id });
      } catch (err) {
        resultados.push({ ...m, sucesso: false, erro: 'Erro ao processar' });
      }
    }

    res.json({ resultados });
  } catch (error) {
    console.error('Sync batch error:', error);
    res.status(500).json({ error: 'Erro ao sincronizar marcações' });
  }
};

export const listar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataInicio, dataFim, usuarioId } = req.query;

    const where: Record<string, unknown> = {};

    if (dataInicio || dataFim) {
      where.dataHoraLocal = {};
      if (dataInicio) (where.dataHoraLocal as Record<string, Date>).gte = new Date(dataInicio as string);
      if (dataFim) (where.dataHoraLocal as Record<string, Date>).lte = new Date(dataFim as string);
    }

    if (usuarioId) where.usuarioId = usuarioId;

    const marcacoes = await prisma.marcacao.findMany({
      where,
      include: { usuario: { select: { id: true, nome: true, cpf: true } } },
      orderBy: { dataHoraLocal: 'desc' }
    });

    res.json(marcacoes);
  } catch (error) {
    console.error('Listar marcacoes error:', error);
    res.status(500).json({ error: 'Erro ao listar marcações' });
  }
};

export const hoje = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id }
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const hoje = new Date();
    const inicioDia = new Date(hoje);
    inicioDia.setHours(0, 0, 0, 0);
    const fimDia = new Date(hoje);
    fimDia.setHours(23, 59, 59, 999);

    const marcacoes = await prisma.marcacao.findMany({
      where: {
        usuarioId: req.usuario.id,
        dataHoraLocal: { gte: inicioDia, lte: fimDia }
      },
      orderBy: { dataHoraLocal: 'asc' }
    });

    const tiposMarcados = marcacoes.map(m => m.tipo);
    const tipoJornada = usuario.tipoJornada as TipoJornada;
    const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;

    res.json({
      data: hoje,
      tipoJornada,
      marcacoes: marcacoes.map(m => ({
        id: m.id,
        tipo: m.tipo,
        dataHora: m.dataHoraLocal,
        latitude: m.latitude,
        longitude: m.longitude
      })),
      proximaMarcacao: getProximaMarcacao(tiposMarcados, tipoJornada),
      todasFeitas: getProximaMarcacao(tiposMarcados, tipoJornada) === null
    });
  } catch (error) {
    console.error('Hoje marcacao error:', error);
    res.status(500).json({ error: 'Erro ao buscar marcações do dia' });
  }
};
