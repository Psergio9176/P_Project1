import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
export declare const criarAjuste: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const listarAjustes: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const meusAjustes: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const avaliarAjuste: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=ajustesController.d.ts.map