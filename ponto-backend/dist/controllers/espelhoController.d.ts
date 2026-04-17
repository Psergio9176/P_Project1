import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
export declare const gerarEspelho: (req: Request, res: Response) => Promise<void>;
export declare const assinarEspelho: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const verificarAssinatura: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=espelhoController.d.ts.map