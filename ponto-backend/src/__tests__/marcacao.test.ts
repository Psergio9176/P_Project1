import { validarOrdemMarcacao, calcularHorasTrabalhadas, formatarHoras, getProximaMarcacao } from '../utils/marcacaoHelper';
import { TipoMarcacao, TipoJornada } from '@prisma/client';

describe('Validação de Marcações', () => {
  describe('getProximaMarcacao', () => {
    it('deve retornar ENTRADA quando não há marcações', () => {
      const resultado = getProximaMarcacao([], 'PADRAO');
      expect(resultado).toBe('ENTRADA');
    });

    it('deve retornar SAIDA_ALMOCO após ENTRADA', () => {
      const resultado = getProximaMarcacao(['ENTRADA'], 'PADRAO');
      expect(resultado).toBe('SAIDA_ALMOCO');
    });

    it('deve retornar RETORNO_ALMOCO após SAIDA_ALMOCO', () => {
      const resultado = getProximaMarcacao(['ENTRADA', 'SAIDA_ALMOCO'], 'PADRAO');
      expect(resultado).toBe('RETORNO_ALMOCO');
    });

    it('deve retornar SAIDA após RETORNO_ALMOCO', () => {
      const resultado = getProximaMarcacao(['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO'], 'PADRAO');
      expect(resultado).toBe('SAIDA');
    });

    it('deve retornar null após todas as marcações', () => {
      const resultado = getProximaMarcacao(['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'], 'PADRAO');
      expect(resultado).toBeNull();
    });

    it('deve funcionar com jornada REDUZIDA', () => {
      const resultado = getProximaMarcacao(['ENTRADA'], 'REDUZIDA');
      expect(resultado).toBe('SAIDA');
    });
  });

  describe('validarOrdemMarcacao', () => {
    it('deve aceitar marcação válida', () => {
      const resultado = validarOrdemMarcacao('ENTRADA', [], 'PADRAO');
      expect(resultado.valido).toBe(true);
    });

    it('deve rejeitar marcação duplicada', () => {
      const resultado = validarOrdemMarcacao('ENTRADA', ['ENTRADA'], 'PADRAO');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('Já existe');
    });

    it('deve rejeitar marcação fora de ordem', () => {
      const resultado = validarOrdemMarcacao('SAIDA', [], 'PADRAO');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('Esperado');
    });
  });

  describe('calcularHorasTrabalhadas', () => {
    it('deve calcular corretamente 8 horas de trabalho', () => {
      const marcacoes = [
        { tipo: 'ENTRADA' as TipoMarcacao, dataHoraLocal: new Date('2026-04-15T08:00:00') },
        { tipo: 'SAIDA_ALMOCO' as TipoMarcacao, dataHoraLocal: new Date('2026-04-15T12:00:00') },
        { tipo: 'RETORNO_ALMOCO' as TipoMarcacao, dataHoraLocal: new Date('2026-04-15T13:00:00') },
        { tipo: 'SAIDA' as TipoMarcacao, dataHoraLocal: new Date('2026-04-15T17:00:00') },
      ];
      
      const minutos = calcularHorasTrabalhadas(marcacoes);
      expect(minutos).toBe(480); // 8 horas = 480 minutos
    });

    it('deve retornar 0 sem marcações completas', () => {
      const marcacoes = [
        { tipo: 'ENTRADA' as TipoMarcacao, dataHoraLocal: new Date('2026-04-15T08:00:00') },
      ];
      
      const minutos = calcularHorasTrabalhadas(marcacoes);
      expect(minutos).toBe(0);
    });
  });

  describe('formatarHoras', () => {
    it('deve formatar corretamente', () => {
      expect(formatarHoras(480)).toBe('8h00m');
      expect(formatarHoras(465)).toBe('7h45m');
      expect(formatarHoras(30)).toBe('0h30m');
    });
  });
});
