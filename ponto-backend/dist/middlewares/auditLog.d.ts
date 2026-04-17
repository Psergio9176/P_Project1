import { Request, Response, NextFunction } from 'express';
export declare enum Acao {
    CREATE_MARCACAO = "CREATE_MARCACAO",
    CREATE_AJUSTE = "CREATE_AJUSTE",
    AJUSTE_APROVADO = "AJUSTE_APROVADO",
    AJUSTE_REJEITADO = "AJUSTE_REJEITADO",
    ESPELHO_GERADO = "ESPELHO_GERADO",
    ESPELHO_ASSINADO = "ESPELHO_ASSINADO",
    USUARIO_CRIADO = "USUARIO_CRIADO",
    USUARIO_ATUALIZADO = "USUARIO_ATUALIZADO",
    USUARIO_DESATIVADO = "USUARIO_DESATIVADO",
    LOGIN = "LOGIN",
    LOGIN_FALHO = "LOGIN_FALHO",
    PUSH_SUBSCRIBE = "PUSH_SUBSCRIBE",
    PUSH_UNSUBSCRIBE = "PUSH_UNSUBSCRIBE"
}
export interface AuthenticatedRequest extends Request {
    usuario?: {
        id: string;
        cpf: string;
        nome: string;
        perfil: string;
    };
}
export declare const criarAuditLog: (req: AuthenticatedRequest, acao: Acao, entidade: string, entidadeId: string, dados?: Record<string, unknown>) => Promise<void>;
export declare const auditMiddleware: (acao: Acao, entidade: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auditLog.d.ts.map