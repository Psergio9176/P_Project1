import { TipoMarcacao, TipoJornada } from '@prisma/client';
export declare const getProximaMarcacao: (marcacoes: TipoMarcacao[], tipoJornada: TipoJornada) => TipoMarcacao | null;
export declare const validarOrdemMarcacao: (tipo: TipoMarcacao, marcacoesExistentes: TipoMarcacao[], tipoJornada: TipoJornada) => {
    valido: boolean;
    erro?: string;
};
export declare const calcularHorasTrabalhadas: (marcacoes: {
    tipo: TipoMarcacao;
    dataHoraLocal: Date;
}[]) => number;
export declare const formatarHoras: (minutos: number) => string;
//# sourceMappingURL=marcacaoHelper.d.ts.map