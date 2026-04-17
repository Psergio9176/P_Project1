import { Request, Response } from 'express';
import { Marcacao, TipoMarcacao, TipoJornada } from '@prisma/client';

const ORDEM_MARCACOES_PADRAO: TipoMarcacao[] = ['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'];
const ORDEM_MARCACOES_REDUZIDA: TipoMarcacao[] = ['ENTRADA', 'SAIDA'];

export const getProximaMarcacao = (
  marcacoes: TipoMarcacao[],
  tipoJornada: TipoJornada
): TipoMarcacao | null => {
  const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
  
  if (marcacoes.length === 0) {
    return ordem[0];
  }
  
  const ultimoTipo = marcacoes[marcacoes.length - 1];
  const ultimoIndex = ordem.indexOf(ultimoTipo);
  
  if (ultimoIndex === -1 || ultimoIndex === ordem.length - 1) {
    return null;
  }
  
  return ordem[ultimoIndex + 1];
};

export const validarOrdemMarcacao = (
  tipo: TipoMarcacao,
  marcacoesExistentes: TipoMarcacao[],
  tipoJornada: TipoJornada
): { valido: boolean; erro?: string } => {
  const ordem = tipoJornada === 'REDUZIDA' ? ORDEM_MARCACOES_REDUZIDA : ORDEM_MARCACOES_PADRAO;
  
  if (marcacoesExistentes.includes(tipo)) {
    return { valido: false, erro: `Já existe marcação de ${tipo} para este dia` };
  }
  
  const esperado = getProximaMarcacao(marcacoesExistentes, tipoJornada);
  if (esperado && esperado !== tipo) {
    return { valido: false, erro: `Esperado registro de ${esperado}` };
  }
  
  return { valido: true };
};

export const calcularHorasTrabalhadas = (
  marcacoes: { tipo: TipoMarcacao; dataHoraLocal: Date }[]
): number => {
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

export const formatarHoras = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = Math.round(minutos % 60);
  return `${horas}h${mins.toString().padStart(2, '0')}m`;
};
