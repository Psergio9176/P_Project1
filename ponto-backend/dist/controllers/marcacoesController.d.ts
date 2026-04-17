import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
export declare const registrar: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const syncBatch: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const listar: (req: Request, res: Response) => Promise<void>;
export declare const hoje: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=marcacoesController.d.ts.map