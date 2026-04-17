"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatarHoras = exports.calcularHorasTrabalhadas = exports.validarOrdemMarcacao = exports.getProximaMarcacao = void 0;
const ORDEM_MARCACOES_PADRAO = ['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'];
const ORDEM_MARCACOES_REDUZIDA = ['ENTRADA', 'SAIDA'];
const getProximaMarcacao = (marcacoes, tipoJornada) => {
    const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
    const ultimoTipo = marcacoes[marcacoes.length - 1];
    const ultimoIndex = ordem.indexOf(ultimoTipo);
    if (ultimoIndex === -1 || ultimoIndex === ordem.length - 1) {
        return null;
    }
    return ordem[ultimoIndex + 1];
};
exports.getProximaMarcacao = getProximaMarcacao;
const validarOrdemMarcacao = (tipo, marcacoesExistentes, tipoJornada) => {
    const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
    if (marcacoesExistentes.includes(tipo)) {
        return { valido: false, erro: `Já existe marcação de ${tipo} para este dia` };
    }
    const esperado = (0, exports.getProximaMarcacao)(marcacoesExistentes, tipoJornada);
    if (esperado && esperado !== tipo) {
        return { valido: false, erro: `Esperado registro de ${esperado}` };
    }
    return { valido: true };
};
exports.validarOrdemMarcacao = validarOrdemMarcacao;
const calcularHorasTrabalhadas = (marcacoes) => {
    let totalMinutos = 0;
    const entrada = marcacoes.find(m => m.tipo === 'ENTRADA');
    const saidaAlmoco = marcacoes.find(m => m.tipo === 'SAIDA_ALMOCO');
    const retornoAlmoco = marcacoes.find(m => m.tipo === 'RETORNO_ALMOCO');
    const saida = marcacoes.find(m => m.tipo === 'SAIDA');
    if (entrada && saidaAlmoco) {
        totalMinutos += (saidaAlmoco.dataHoraLocal.getTime() - entrada.dataHoraLocal.getTime()) / 60000;
    }
    if (retornoAlmoco && saida) {
        totalMinutos += (saida.dataHoraLocal.getTime() - retornoAlmoco.dataHoraLocal.getTime()) / 60000;
    }
    return totalMinutos;
};
exports.calcularHorasTrabalhadas = calcularHorasTrabalhadas;
const formatarHoras = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h${mins.toString().padStart(2, '0')}m`;
};
exports.formatarHoras = formatarHoras;
//# sourceMappingURL=marcacaoHelper.js.map