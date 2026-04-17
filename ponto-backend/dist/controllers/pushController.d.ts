import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
export declare const getVapidPublicKey: (_req: Request, res: Response) => void;
export declare const subscribe: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const unsubscribe: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const enviarLembrete: (usuarioId: string, mensagem: string) => Promise<void>;
//# sourceMappingURL=pushController.d.ts.map