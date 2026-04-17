import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Perfil } from '@prisma/client';

export interface JwtPayload {
  id: string;
  cpf: string;
  nome: string;
  perfil: Perfil;
  tipoJornada: string;
  unidadeId: string;
}

export interface AuthenticatedRequest extends Request {
  usuario?: JwtPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JwtPayload;
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const perfilMiddleware = (perfis: Perfil[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!perfis.includes(req.usuario.perfil)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};
