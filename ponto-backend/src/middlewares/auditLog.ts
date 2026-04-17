import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export enum Acao {
  CREATE_MARCACAO = 'CREATE_MARCACAO',
  CREATE_AJUSTE = 'CREATE_AJUSTE',
  AJUSTE_APROVADO = 'AJUSTE_APROVADO',
  AJUSTE_REJEITADO = 'AJUSTE_REJEITADO',
  ESPELHO_GERADO = 'ESPELHO_GERADO',
  ESPELHO_ASSINADO = 'ESPELHO_ASSINADO',
  USUARIO_CRIADO = 'USUARIO_CRIADO',
  USUARIO_ATUALIZADO = 'USUARIO_ATUALIZADO',
  USUARIO_DESATIVADO = 'USUARIO_DESATIVADO',
  LOGIN = 'LOGIN',
  LOGIN_FALHO = 'LOGIN_FALHO',
  PUSH_SUBSCRIBE = 'PUSH_SUBSCRIBE',
  PUSH_UNSUBSCRIBE = 'PUSH_UNSUBSCRIBE',
}

export interface AuthenticatedRequest extends Request {
  usuario?: {
    id: string;
    cpf: string;
    nome: string;
    perfil: string;
  };
}

export const criarAuditLog = async (
  req: AuthenticatedRequest,
  acao: Acao,
  entidade: string,
  entidadeId: string,
  dados?: Record<string, unknown>
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        usuarioId: req.usuario?.id || 'sistema',
        acao,
        entidade,
        entidadeId,
        dados: dados as Prisma.InputJsonValue | undefined,
        ip: req.ip || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });
  } catch (error) {
    console.error('Erro ao criar audit log:', error);
  }
};

export const auditMiddleware = (acao: Acao, entidade: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const paramsId = req.params.id;
        const entidadeId = (Array.isArray(paramsId) ? paramsId[0] : paramsId) || 
          (typeof data === 'object' && data !== null ? (data as Record<string, unknown>).id as string : 'unknown');
        
        criarAuditLog(req, acao, entidade, entidadeId, data as Record<string, unknown>);
      }
      
      return originalJson(data);
    };
    
    next();
  };
};
