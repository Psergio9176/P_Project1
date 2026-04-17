import { Request, Response, NextFunction } from 'express';
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
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const perfilMiddleware: (perfis: Perfil[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map