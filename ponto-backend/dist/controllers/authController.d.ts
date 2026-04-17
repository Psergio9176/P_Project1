import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const refresh: (req: Request, res: Response) => Promise<void>;
export declare const logout: (_req: Request, res: Response) => void;
export declare const me: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map