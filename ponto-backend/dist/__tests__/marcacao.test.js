"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marcacaoHelper_1 = require("../utils/marcacaoHelper");
describe('Validação de Marcações', () => {
    describe('getProximaMarcacao', () => {
        it('deve retornar ENTRADA quando não há marcações', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)([], 'PADRAO');
            expect(resultado).toBe('ENTRADA');
        });
        it('deve retornar SAIDA_ALMOCO após ENTRADA', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)(['ENTRADA'], 'PADRAO');
            expect(resultado).toBe('SAIDA_ALMOCO');
        });
        it('deve retornar RETORNO_ALMOCO após SAIDA_ALMOCO', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)(['ENTRADA', 'SAIDA_ALMOCO'], 'PADRAO');
            expect(resultado).toBe('RETORNO_ALMOCO');
        });
        it('deve retornar SAIDA após RETORNO_ALMOCO', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)(['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO'], 'PADRAO');
            expect(resultado).toBe('SAIDA');
        });
        it('deve retornar null após todas as marcações', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)(['ENTRADA', 'SAIDA_ALMOCO', 'RETORNO_ALMOCO', 'SAIDA'], 'PADRAO');
            expect(resultado).toBeNull();
        });
        it('deve funcionar com jornada REDUZIDA', () => {
            const resultado = (0, marcacaoHelper_1.getProximaMarcacao)(['ENTRADA'], 'REDUZIDA');
            expect(resultado).toBe('SAIDA');
        });
    });
    describe('validarOrdemMarcacao', () => {
        it('deve aceitar marcação válida', () => {
            const resultado = (0, marcacaoHelper_1.validarOrdemMarcacao)('ENTRADA', [], 'PADRAO');
            expect(resultado.valido).toBe(true);
        });
        it('deve rejeitar marcação duplicada', () => {
            const resultado = (0, marcacaoHelper_1.validarOrdemMarcacao)('ENTRADA', ['ENTRADA'], 'PADRAO');
            expect(resultado.valido).toBe(false);
            expect(resultado.erro).toContain('Já existe');
        });
        it('deve rejeitar marcação fora de ordem', () => {
            const resultado = (0, marcacaoHelper_1.validarOrdemMarcacao)('SAIDA', [], 'PADRAO');
            expect(resultado.valido).toBe(false);
            expect(resultado.erro).toContain('Esperado');
        });
    });
    describe('calcularHorasTrabalhadas', () => {
        it('deve calcular corretamente 8 horas de trabalho', () => {
            const marcacoes = [
                { tipo: 'ENTRADA', dataHoraLocal: new Date('2026-04-15T08:00:00') },
                { tipo: 'SAIDA_ALMOCO', dataHoraLocal: new Date('2026-04-15T12:00:00') },
                { tipo: 'RETORNO_ALMOCO', dataHoraLocal: new Date('2026-04-15T13:00:00') },
                { tipo: 'SAIDA', dataHoraLocal: new Date('2026-04-15T17:00:00') },
            ];
            const minutos = (0, marcacaoHelper_1.calcularHorasTrabalhadas)(marcacoes);
            expect(minutos).toBe(480); // 8 horas = 480 minutos
        });
        it('deve retornar 0 sem marcações completas', () => {
            const marcacoes = [
                { tipo: 'ENTRADA', dataHoraLocal: new Date('2026-04-15T08:00:00') },
            ];
            const minutos = (0, marcacaoHelper_1.calcularHorasTrabalhadas)(marcacoes);
            expect(minutos).toBe(0);
        });
    });
    describe('formatarHoras', () => {
        it('deve formatar corretamente', () => {
            expect((0, marcacaoHelper_1.formatarHoras)(480)).toBe('8h00m');
            expect((0, marcacaoHelper_1.formatarHoras)(465)).toBe('7h45m');
            expect((0, marcacaoHelper_1.formatarHoras)(30)).toBe('0h30m');
        });
    });
});
//# sourceMappingURL=marcacao.test.js.map